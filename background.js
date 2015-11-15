chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		var rule = {
			"name": "Strict-Transport-Security",
			"value": "max-age=3600;"
		};
		details.responseHeaders.push(rule);
		return {responseHeaders: details.responseHeaders};
    },
    {
        urls: [
			"https://*"
		],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking", "responseHeaders" ]
);
