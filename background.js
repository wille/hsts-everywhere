// Default max-age 6 months in seconds
var max_age = "15570000";

var ignore = [
	"www.aftonbladet.se"
];

chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		var exists = false;
		
		var x = document.createElement("a");
		x.href = details.url;
		
		for (var i = 0; i < ignore.length; i++) {
			if (x.hostname === ignore[i]) {
				return { };
			}
		}
		
		for (var i = 0; i < details.responseHeaders.length; i++) {
			if (details.responseHeaders[i].name.toLowerCase() === "strict-transport-security") {
				exists = true;
				break;
			}
		}
		
		if (!exists) {
			var rule = {
				"name": "Strict-Transport-Security",
				"value": "max-age=" + max_age + ";"
			};
			
			details.responseHeaders.push(rule);
			return {responseHeaders: details.responseHeaders};
		} else {
			// Do not modify anything
			return { };
		}
    },
    {
        urls: [
			"https://*/*"
		],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking", "responseHeaders" ]
);
