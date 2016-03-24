// Default max-age 6 months in seconds
var max_age = "15570000";

//NB: I left these two in 'ignore' as samples, but since I'm planning on permanently using HTTPS-Everywhere with 'Block HTTP requests', I won't be doing any HTTP requests ever, and thus I can afford to also set 'includeSubDomains' below.
var ignore = [
"pastebin.com",
"arstechnica.com",
];

chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
	
		if ( ignore.indexOf(new URL(details.url).hostname) > -1 ) {
      console.log("1");
			return { };
    }
		
		for (var i = 0; i < details.responseHeaders.length; i++) {
//      console.log(details.responseHeaders[i].name);
			if (details.responseHeaders[i].name.toLowerCase() === "strict-transport-security") {
        console.log("2");
  			return { };
      }
		}
		
		details.responseHeaders.push({
			"name": "Strict-Transport-Security",
			"value": "max-age=" + max_age + "; includeSubDomains" //src: https://www.chromium.org/hsts
        //check HSTS status: under HSTS(while Capture is enabled!) then 'Query domain' from here chrome://net-internals/#hsts If "*_upgrade_mode: STRICT" then HSTS is on! How to interpret: https://security.stackexchange.com/questions/68883/checking-domains-hsts-status
        //also note, if 'broken HTTPS' (eg. https://rustbyexample.com since it's hosted by github) then the above query will yield 'Not found'
		});

    console.log("3");
		return {responseHeaders: details.responseHeaders};
	},
	{
		urls: ["https://*/*"],
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	},
	["blocking", "responseHeaders" ]
);
