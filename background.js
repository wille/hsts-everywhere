// Default max-age 6 months in seconds
var max_age = "15570000";
//TODO: change log types to can do OR and show types of logs eg. show HSTS forced enabled, or forced disabled, or redirs ignored, redirs filtered,  and/or. rather than info, debug, verbose, etc.
//TODO: get rid of the 'new'
var loglevels={};
var blockhttp=true;//true if to block HTTP request for ignored hosts, false allow; otherwise, if host is not in ignore list it will be forced HTTPS! or it will fail to load(ie. if site is http only). Or in case of redirect loops(http->https->http) then the last http is allowed or not based on this value.(and that host is virtually ignored for the duration of the request and thus allowed to http complete)

//Note: access the following console.log() messages by going chrome://extensions/ then clicking the 'background page' seen as 'Inspect views: background page' under this extension (HSTS Everywhere) then chosing the 'Console' tab.


//src: https://stackoverflow.com/questions/1125256/how-to-create-a-constant-in-javascript
function setConstant(obj, key, value) {//eg. setConstant(loglevels, "NONE", 0);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: false,
    writable: false,
    value: value,
  });
}

setConstant(loglevels, "NONE", 00);
setConstant(loglevels, "ERR", 10);
setConstant(loglevels, "ERROR", 10);
setConstant(loglevels, "WARN", 20);
setConstant(loglevels, "INFO", 30);
setConstant(loglevels, "VERB", 40);
setConstant(loglevels, "VERBOSE", 40);
setConstant(loglevels, "DEBUG", 50);
//set this in Console! eg. loglevel = logelevels.DEBUG
var loglevel = loglevels.NONE;//don't log anything by default, I read somewhere in passing that it's slow and saved to disk by chromium...

function log(level, msg) {//should never pass NONE level when calling!
  if (level <= loglevel) {
    if (level == loglevels.WARN) {
      console.warn(msg);
      //TODO: add console.err  or is it .error ? check and see!
    }else{
      console.log(msg);
    }
  }
}

function logverb(msg) {
  log(loglevels.VERBOSE, msg);
}

function logwarn(msg) {
  log(loglevels.WARN, msg);
}

function loginfo(msg) {
  log(loglevels.INFO, msg);
}

function logdebug(msg) {
  log(loglevels.DEBUG, msg);
}

//NB: I left these two in 'ignore' as samples, but since I'm planning on permanently using HTTPS-Everywhere with 'Block HTTP requests', I won't be doing any HTTP requests ever, and thus I can afford to also set 'includeSubDomains' below.
//This is a list of hosts for which to ignore HSTS (but if they specify HSTS in headers it will pass through to the browser! TODO: check if this is so!):
var ignore = [//TODO: ignore in http->https redir too!
  "pastebin.com",
  "arstechnica.com",
//  "imdb.com",
//  "www.imdb.com",
];

Array.prototype.clone = function() {
    return this.slice(0);
}; //src: https://davidwalsh.name/javascript-clone-array

//The following is list of hosts for which to force disable HSTS(incl. subdomains), this takes precedence over the ignore list above; just beware that if you're visiting a subdomain of a host listed here, it will enable HSTS for it and its subdomains; ie. 'test.com' will be force-disabled, but since it redirs to www.test.com this one will be force-enabled(and any subdomains like *.www.test.com, if any, due to 'includeSubDomains' below)
var forceDisable = ignore.clone();
forceDisable = forceDisable.concat([ //src: http://www.w3schools.com/jsref/jsref_concat_array.asp
    'test.com',
    'www.w3schools.com',
]);

//hashmap? src: https://stackoverflow.com/questions/8877666/how-is-a-javascript-hash-map-implemented
var redirloopdetect={}; //"hashmap"!

var cwr = chrome.webRequest;

//so, this part will force all http attempts to go through https ! and if they can't because no https server is listening well, too bad... you'll get a ERR_CONNECTION_REFUSED as usual.
//why did I need this? well, the links from Variable bindings from here, for example: https://github.com/carols10cents/rustlings#variable-bindings were all http and https-everywhere wasn't doing anything about them (whilst 'Block All HTPP requests' being set was stropping anything from loading - so, don't need https-everywhere anymore now, i suppose)
cwr.onBeforeRequest.addListener(
    function(details) {
//  console.log(details);
    ishttp=false;
    redirecturl = details.url;
    if (redirecturl.substring(0,5) === "http:") {
      ishttp=true;

      hostn = new URL(redirecturl).hostname;
      fullh = hostn+" (full: "+details.url+" )";
      if ( ignore.indexOf(hostn) > -1 ) {
        logverb("Host in ignore list: '"+fullh+"' therefore redir to https not forced! And this request is "+(blockhttp?"NOT ":"")+"allowed! Type 'blockhttp=true/false' in Console to change!");
        return { cancel: blockhttp };
      }

      if (details.requestId in redirloopdetect) {
        if (redirecturl.substring(0,5) !== "http:") {
          logwarn("Developer fail! this should always be 'http', it's: "+redirecturl);
          alert("Developer fail! this should always be 'http', it's: "+redirecturl);
        }
        //done: maybe just redir back to http instead? and based on blockhttp allow or not
        /*if (!blockhttp) {
          //manually add to ignore list or else it will redirect indefinitely, since we'll try to https it again!
        }*/
        if (blockhttp) {
          loginfo("Cancelled http (id="+details.requestId+") redir-loop to '"+ redirecturl+"' (you might want to allow http or else this will never succeed!)");
//          logdebug("Blocked http to '"+ redirecturl);
          delete redirloopdetect[details.requestId];
        }else{
          logverb("Allowed http (id="+details.requestId+") to '"+ redirecturl);
        }
        return { cancel: blockhttp };//, redirectUrl: redirecturl };//HSTS being enabled and us not canceling this even tho it's a http request, will cause a https request to happen next!
      }

      details.url = redirecturl = redirecturl.slice(0,4) + "s" + redirecturl.slice(4);
      logverb("ForcedHTTPS as: '"+redirecturl+"'");
    } else {
      logwarn("!!!Sneaked url: "+redirecturl);//XXX: if this happens, it's some serious issue afoot!
      alert("!!! IMPOSSIBIRU! Congratulations, you've just discovered the impossible! This url '"+redirecturl+"' was not a http url but was caught by the http filter. The request is about to be stopped after you exit this, but make a screenshot first and show it around, since this probably means there's a bug in chromium!");
      return { cancel: true }
    }
    return { redirectUrl: redirecturl } //XXX: but HTTPS-Everywhere with 'Block HTTP request' will still cancel it! because details.url it receives is the same http one!
}, {
  urls: ["http://*/*"],
}, ["blocking"]);


cwr.onBeforeRedirect.addListener(
    function(details) {
      //we're here because https tried to redirect to http! but we don't know if we forcefully set https and then got redirected back to http! yet.
      if (details.redirectUrl.substring(0,5) !== "http:") {
        loginfo("Detected ignored redirect to '"+details.redirectUrl+"' from '"+details.url+"'");
        return;
      }
      //ok, here, only redirects to http!
      loginfo("Detected https->http Redirect to '"+details.redirectUrl+"' from '"+details.url+"'");
      //eg. "Detected https->http Redirect to 'https://www.google.com/' from 'https://google.com/'"
      //Sample url which tries to redirect indefinitely(but chromium ofc. stops it after like 11 redirs): http://www.imdb.com/title/tt0088847/
//      console.log(details);
      //XXX: but details.requestId is the same on each redirect!
      //so maybe allow the redirect to happen one more time and then we know if it's in a loop!
      if (!(details.requestId in redirloopdetect)) {
        //flag only when the same url (except the protocol being different!)
        //since we're this far in, we know that details.url is https and redirectUrl is http !
        //XXX: to test this, go here: https://stackoverflow.com/questions/21747136/how-do-i-print-the-type-of-a-variable-in-rust/25413103#25413103 then click the link with the text 'Shubham's answer'
        if (details.url.substring(5) === details.redirectUrl.substring(4)) {
          logdebug("Flagging "+details.requestId+" redirect to: '"+details.redirectUrl+"' from '"+details.url+"'");
          //       return { cancel: true }//hopefully? just guessing! 'It does not allow you to modify or cancel the request.' src: https://developer.chrome.com/extensions/webRequest
          //      }else{
        redirloopdetect[details.requestId] = true;//any value i guess
        //and can't cancel it here! 'It does not allow you to modify or cancel the request.' src: https://developer.chrome.com/extensions/webRequest
        } else {
          logdebug("Not flagging "+details.requestId+" redirect to: '"+details.redirectUrl+"' from '"+details.url+"'");
        }
      }
}, {
  urls: ["https://*/*"],//ok, this means the redir FROM this type of url, to any other type, is detected! eg. redir dest url can be http or https or anything else even!
});

cwr.onHeadersReceived.addListener(
	function(details) {
	
    thisage=max_age;
    hostn = new URL(details.url).hostname;
    fullh = hostn+" (full: "+details.url+" )";

    force_disable=false
      if (details.requestId in redirloopdetect) {
        delete redirloopdetect[details.requestId];
        //this means we need to force-disable the HSTS which we already set! or else it will redir loop! but we're here because we're allowing http request after a fail of such redir to https(because that site, eg. imdb, redir-ed us to http on its own!)
        loginfo("BOO! "+details.requestId+" "+details.url);
        //return { cancel: true };
        force_disable=true
      }
    if ( forceDisable.indexOf(hostn) > -1 ) {
      force_disable=true
      logverb("Host in forceDisable list: "+fullh); //eg. https://pastebin.com
    }

//    ignored=false;
		if ( ignore.indexOf(hostn) > -1 ) {
      logverb("Host in ignore list: '"+fullh+"' therefore HSTS not forced!"); //eg. https://pastebin.com
//      ignored=true;
			if (! force_disable) {//forceDisable list takes precedence over ignore list!
        return { }; //TODO: Does {} mean that no changes were perfomed to headers? so original headers are preserved? check online docs to see if this is so!
      }
    }
		

		for (var i = 0; i < details.responseHeaders.length; i++) {
//      console.log(details.responseHeaders[i].name);
			if (details.responseHeaders[i].name.toLowerCase() === "strict-transport-security") {
/*        if (ignored) {
          //remove HSTS header if host is in ignored list; OR we can leave it and set max-age to 0 to disable HSTS...
          details.responseHeaders.splice(i,1); //remove 1 item from index i; src: http://www.w3schools.com/jsref/jsref_splice.asp
        } else {*/
        logverb("HSTS already set in host's response headers: "+fullh+" "+details.responseHeaders[i].value); //eg. grc.com  max-age=31536000; preload
        if ( ! force_disable ) {
    			return { };
        }
//        }
      }
		}
		
    if ( force_disable ) {
      //How to turn off an already set(aka browser rememberes) HSTS setting? src: https://wordpress.org/support/topic/want-to-turn-off-http-strict-transport-security-hsts-header
      thisage=0; //confirmed to work on chromium 49.0.2623.87 (Developer Build) (64-bit)  via  Query Domain (after manually having added it with the above 'Add domain', see chrome://net-internals/#hsts )
    }

		details.responseHeaders.push({
			"name": "Strict-Transport-Security",
			"value": "max-age=" + thisage + "; includeSubDomains" //src: https://www.chromium.org/hsts
        //check HSTS status: under HSTS(while Capture is enabled!) then 'Query domain' from here chrome://net-internals/#hsts If "*_upgrade_mode: STRICT" then HSTS is on! How to interpret: https://security.stackexchange.com/questions/68883/checking-domains-hsts-status
        //also note, if 'broken HTTPS' (eg. https://rustbyexample.com since it's hosted by github) then the above query will yield 'Not found'
		});

    logverb("Force-"+(force_disable?"disabling":"enabling")+" HSTS for: "+fullh+" "+details.responseHeaders[details.responseHeaders.length-1].value);
		return {responseHeaders: details.responseHeaders};
	},
	{
		urls: ["https://*/*"],//http-only will never send HSTS headers - so is the spec.!
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other",
    "font", "ping",
    //rest are not accepted: "xbl", "xslt", "ping", "beacon", "xml_dtd", "font", "media", "websocket", "csp_report", "imageset", "web_manifest" src: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/WebRequest/ResourceType
    //FIXME: catch behind-the-scenes too! eg. uBlock/uMatrix can, also they can fetch resources over http!
    ]
	},
	["blocking", "responseHeaders" ]
);
