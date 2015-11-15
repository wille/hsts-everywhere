chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
		
        return { };
    },
    {
        urls: [
			"https://*"
		],
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
    },
    ["blocking", "responseHeaders" ]
);
