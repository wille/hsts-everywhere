// Default max-age 6 months in seconds
var max_age = "15570000";

chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		var exists = false;
		
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
