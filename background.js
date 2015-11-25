// Default max-age 6 months in seconds
var max_age = "15570000";

var ignore = [
"www.w3.org",	
"www.nytimes.com",	
"api.twitch.tv",	
"www.aftonbladet.se",	
"streams.twitch.tv",
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
	
		if ( ignore.indexOf(new URL(details.url).hostname) > -1 )
			return { };
		
		for (var i = 0; i < details.responseHeaders.length; i++) {
			if (details.responseHeaders[i].name.toLowerCase() === "strict-transport-security")
			return { };
		}
		
		details.responseHeaders.push({
			"name": "Strict-Transport-Security",
			"value": "max-age=" + max_age + ";"
		});

		return {responseHeaders: details.responseHeaders};
	},
	{
		urls: ["https://*/*"],
		types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
	},
	["blocking", "responseHeaders" ]
);
