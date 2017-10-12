import WebResponseHeadersDetails = chrome.webRequest.WebResponseHeadersDetails;

// Default max-age 6 months in seconds
const maxAge = "15570000";

chrome.webRequest.onHeadersReceived.addListener((details: WebResponseHeadersDetails) => {
        const headers = details.responseHeaders;

        if (!isBlacklisted(details.url) && headers) {
            for (let header of headers) {
                if (header.name.toLowerCase() === "strict-transport-security") {
                    return;
                }
            }

            headers.push({
                name: "Strict-Transport-Security",
                value: "max-age=" + maxAge + ";"
            });

            return {
                responseHeaders: headers
            };
        }
    },
    {
        types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"],
        urls: ["https://*/*"],
    },
    [
        "blocking",
        "responseHeaders"
    ]
);
