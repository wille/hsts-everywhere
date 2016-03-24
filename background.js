// Default max-age 6 months in seconds
var max_age = "15570000";

//NB: I left these two in 'ignore' as samples, but since I'm planning on permanently using HTTPS-Everywhere with 'Block HTTP requests', I won't be doing any HTTP requests ever, and thus I can afford to also set 'includeSubDomains' below.
var ignore = [
"pastebin.com",
"arstechnica.com",
];

//Note: access the following console.log() messages by going chrome://extensions/ then clicking the 'background page' seen as 'Inspect views: background page' under this extension (HSTS Everywhere) then chosing the 'Console' tab.

chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
	
    hostn = new URL(details.url).hostname;
    fullh = hostn+" (full: "+details.url+" )";
		if ( ignore.indexOf(hostn) > -1 ) {
      console.log("Host in ignore list: "+fullh); //eg. https://pastebin.com
			return { };
    }
		
		for (var i = 0; i < details.responseHeaders.length; i++) {
//      console.log(details.responseHeaders[i].name);
			if (details.responseHeaders[i].name.toLowerCase() === "strict-transport-security") {
        console.log("HSTS already set in host's response: "+fullh+" "+details.responseHeaders[i].value); //eg. grc.com  max-age=31536000; preload
  			return { };
      }
		}
		
		details.responseHeaders.push({
			"name": "Strict-Transport-Security",
			"value": "max-age=" + max_age + "; includeSubDomains" //src: https://www.chromium.org/hsts
        //check HSTS status: under HSTS(while Capture is enabled!) then 'Query domain' from here chrome://net-internals/#hsts If "*_upgrade_mode: STRICT" then HSTS is on! How to interpret: https://security.stackexchange.com/questions/68883/checking-domains-hsts-status
        //also note, if 'broken HTTPS' (eg. https://rustbyexample.com since it's hosted by github) then the above query will yield 'Not found'
		});

    console.log("Forcing HSTS for: "+fullh+" "+details.responseHeaders[details.responseHeaders.length-1].value);
		return {responseHeaders: details.responseHeaders};
	},
	{
		urls: ["https://*/*"],
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	},
	["blocking", "responseHeaders" ]
);
