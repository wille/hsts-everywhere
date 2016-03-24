// Default max-age 6 months in seconds
var max_age = "15570000";

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
			"value": "max-age=" + max_age + ";"
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
