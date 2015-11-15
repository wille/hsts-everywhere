// Default max-age 1 hour in seconds
var max-age = "3600";

chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		var exists = false;
		
		for (var i = 0; i < details.responseHeaders.length; i++) {
			if (details.responseHeaders[i].name === "Strict-Transport-Security") {
				exists = true;
				break;
			}
		}
		
		if (exists) {
			var rule = {
				"name": "Strict-Transport-Security",
				"value": "max-age=" + max-age + ";"
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
