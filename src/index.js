/// <reference path="../node_modules/web-ext-types/global/index.d.ts" />

import browser from 'webextension-polyfill';
import matcher from 'matcher';
import ignoreRules from './rules.json';

// Default max-age 6 months in seconds
const max_age = '15570000';
const blockHttp = false;

const redirLoop = {};

function ignore(hostname) {
  return matcher([hostname], ignoreRules).length > 0;
}

browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.requestId in redirLoop) {
      if (blockHttp) {
        console.log(
          'Cancelled http (id=' +
            details.requestId +
            ') redir-loop to \'' +
            details.url +
            '\' (you might want to allow http or else this will never succeed!)'
        );
        delete redirLoop[details.requestId];
      } else {
        console.log('Allowed http (id=' + details.requestId + ') to \'' + details.url);
      }

      return { cancel: blockHttp };
    }
  },
  { urls: ['http://*/*'] },
  ['blocking']
);

browser.webRequest.onBeforeRedirect.addListener(
  function(details) {
    // ignore redirects to other protocols than http
    if (details.redirectUrl.substring(0, 5) !== 'http:') {
      return;
    }

    if (!(details.requestId in redirLoop)) {
      // downgrade from https to http
      if (details.url.substring(5) === details.redirectUrl.substring(4)) {
        console.log(
          'Flagging ' + details.requestId + ' redirect to: \'' + details.redirectUrl + '\' from \'' + details.url + '\''
        );
        redirLoop[details.requestId] = true;
      } else {
        console.log(
          'Not flagging ' + details.requestId + ' redirect to: \'' + details.redirectUrl + '\' from \'' + details.url + '\''
        );
      }
    }
  },
  {
    urls: ['https://*/*']
  }
);

browser.webRequest.onHeadersReceived.addListener(
  function onHeadersReceived(details) {
    const url = new URL(details.url);

    let forceDisable = false;

    if (ignore(url.hostname)) {
      console.log('Blocked HSTS enforcement on:', details.url);
      return;
    }

    if (details.requestId in redirLoop) {
      delete redirLoop[details.requestId];

      //this means we need to force-disable the HSTS which we already set! or else it will redir loop! but we're here because we're allowing http request after a fail of such redir to https(because that site, eg. imdb, redir-ed us to http on its own!)
      console.log('Redirect loop detected! ' + details.requestId + ' ' + details.url);
      forceDisable = true;
    }

    for (let i = 0; i < details.responseHeaders.length; i++) {
      if (details.responseHeaders[i].name.toLowerCase() === 'strict-transport-security') {
        if (forceDisable) {
          details.responseHeaders.splice(i, 1);
        } else {
          console.log('Skipping because of existing header:', details.url);
          return;
        }
      }
    }

    const age = forceDisable ? 0 : max_age;

    details.responseHeaders.push({
      name: 'Strict-Transport-Security',
      value: `max-age=${age};`
    });

    console.log(forceDisable ? 'Disabling' : 'Enabling', 'HSTS for', url.toString());
    
    return {
      responseHeaders: details.responseHeaders
    };
  },
  {
    urls: ['https://*/*'],
    types: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'object', 'xmlhttprequest', 'other']
  },
  ['blocking', 'responseHeaders', 'extraHeaders']
);
