const blacklistedHosts = [
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
    "activerain.com",
    "www.seek.com.au",
    "www.liteneasy.com.au",
    "store.vmware.com",
    "imgbox.com",
    "www.webhallen.com",
    "arstechnica.com",
    "shop.oreilly.com",
    "www.apple.com",
    "www.amazon.com",
    "www.petbarn.com.au",
    "www.slideshare.net",
    "www.blocket.se",
    "www.tre.se"
];

function isBlacklisted(host: string | URL) {
    if (host instanceof URL) {
        host = host.hostname;
    }

    return blacklistedHosts.indexOf(host) > -1;
}