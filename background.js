// Default max-age 6 months in seconds
var max_age = "15570000";
var loglevels={};

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
    }else{
      console.log(msg);
    }
  }
}

//NB: I left these two in 'ignore' as samples, but since I'm planning on permanently using HTTPS-Everywhere with 'Block HTTP requests', I won't be doing any HTTP requests ever, and thus I can afford to also set 'includeSubDomains' below.
//This is a list of hosts for which to ignore HSTS (but if they specify HSTS in headers it will pass through to the browser! TODO: check if this is so!):
var ignore = [
"pastebin.com",
"arstechnica.com",
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

//Note: access the following console.log() messages by going chrome://extensions/ then clicking the 'background page' seen as 'Inspect views: background page' under this extension (HSTS Everywhere) then chosing the 'Console' tab.

var cwr = chrome.webRequest;
//TODO: make logging optional! eg. depending on a var that can be set on Console!

//so, this part will force all http attempts to go through https ! and if they can't because no https server is listening well, too bad... you'll get a ERR_CONNECTION_REFUSED as usual.
cwr.onBeforeRequest.addListener(
    function(details) {
//  console.log(details);
    ishttp=false;
    redirecturl = details.url;
    if (redirecturl.substring(0,5) === "http:") {
      ishttp=true;
      details.url = redirecturl = redirecturl.slice(0,4) + "s" + redirecturl.slice(4);
      log(loglevels.VERB, "ForcedHTTPS as: '"+redirecturl+"'")
    } else {
      log(loglevels.WARN, "!!!Sneaked url: "+redirecturl);//XXX: if this happens, it's some serious issue afoot!
    }
/*    if (details.url.substring(0,5) === "http:") {//XXX: changing details.url doesn't matter!
      console.log("IMPOSSIBLE! "+details.url);
      return { cancel: true }
    }*/
    return { redirectUrl: redirecturl } //XXX: but HTTPS-Everywhere with 'Block HTTP request' will still cancel it! because details.url it receives is the same http one!
}, {
  urls: ["http://*/*"],
}, ["blocking"]);

cwr.onHeadersReceived.addListener(
	function(details) {
	
    thisage=max_age;
    hostn = new URL(details.url).hostname;
    fullh = hostn+" (full: "+details.url+" )";

    force_disable=0
    if ( forceDisable.indexOf(hostn) > -1 ) {
      force_disable=1
      log(loglevels.VERB, "Host in forceDisable list: "+fullh); //eg. https://pastebin.com
    }

//    ignored=false;
		if ( ignore.indexOf(hostn) > -1 ) {
      log(loglevels.VERB, "Host in ignore list: "+fullh); //eg. https://pastebin.com
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
        log(loglevels.VERB, "HSTS already set in host's response headers: "+fullh+" "+details.responseHeaders[i].value); //eg. grc.com  max-age=31536000; preload
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

    log(loglevels.VERB, "Force-"+(force_disable?"disabling":"enabling")+" HSTS for: "+fullh+" "+details.responseHeaders[details.responseHeaders.length-1].value);
		return {responseHeaders: details.responseHeaders};
	},
	{
		urls: ["https://*/*"],//http-only will never send HSTS headers - so is the spec.!
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	},
	["blocking", "responseHeaders" ]
);
