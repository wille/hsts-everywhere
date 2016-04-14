# hsts-everywhere-chrome

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ingdjdekfhnapeoiiinplcadnfimnnkh.svg)
![Chrome Web Store](https://img.shields.io/chrome-web-store/d/ingdjdekfhnapeoiiinplcadnfimnnkh.svg?maxAge=2592000)
![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/ingdjdekfhnapeoiiinplcadnfimnnkh.svg?maxAge=2592000)
![Chrome Web Store](https://img.shields.io/chrome-web-store/rating-count/ingdjdekfhnapeoiiinplcadnfimnnkh.svg?maxAge=2592000)

Forces Chrome to use HTTP Strict Transport Security on all HTTPS connections

Default max-age is 6 months. Change this in [background.js](background.js) in seconds

```javascript
var max_age = "15570000";
```

## Credits

- [chloe](https://keybase.io/dotchloe)
