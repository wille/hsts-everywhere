// Default max-age 6 months in seconds
var max_age = "15570000";

var ignore = [
"www.aftonbladet.se",	
"9gag.com",
"pastebin.com",
"nitroflare.com",
"www.metafilter.com",
"www.sarizeybekhaber.com.tr",
"www.grandbux.net",
"www.svt.se",
"www.hsbc.com",
"www.avvo.com",
"www.lexiadz.com",
"www.adzbazar.com",
"fodors.com",
"www.chacha.com",
"www.skapiec.pl",
"www.lunapic.com",
"zivame.com",
"www.gameinformer.com",
"brighthouse.com",
"www.stafaband.info",
"forum.uaewomen.net",
"www.ultimateclixx.com",
"www.egotastic.com",
"www.sugobbs.com",
"www.thairath.co.th",
"fishki.pl",
"zakupka.com",
"www.usu.edu",
"uncc.edu",
"www.egotasticallstars.com",
"cinestar.de",
"www.clixblue.com",
"soccer-king.jp",
"bonusb2c.com",
"www.etouches.com",
"www.pixiz.com",
"www.justcloud.com",
"www.carsguide.com.au",
"activerain.com"
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
