/// <reference path="../node_modules/web-ext-types/global/index.d.ts" />

import browser from 'webextension-polyfill';
import matcher from 'matcher';
import ignoreRules from './rules.json';
 
// Default max-age 6 months in seconds
const max_age = "15570000";

function onHeadersReceived(details) {
	const url = new URL(details.url);

	if (matcher([url.hostname], ignoreRules).length > 0) {
		console.log("Blocked HSTS enforcement on:", details.url);
		return;
	}

	for (const header of details.responseHeaders) {
		if (header.name.toLowerCase() === "strict-transport-security") {
			console.log("Skipping because of existing header:", details.url);
			return;
		}
	}

	details.responseHeaders.push({
		name: "Strict-Transport-Security",
		value: `max-age="${max_age}";`
	});
}

browser.webRequest.onHeadersReceived.addListener(
	onHeadersReceived,
	{
		urls: ["https://*/*"],
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	},
	["blocking", "responseHeaders"]
);
