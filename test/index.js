const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const pemPath = path.resolve(__dirname, 'cert.pem');

const httpApp = express();
httpApp.get('/', (req, res) => {
  res.end('Visiting over HTTP')
})
httpApp.get('/redirect', (req, res) => {
  res.end('HSTS redirect loop escaped');
});

const httpsApp = express();
httpsApp.get('/redirect', (req, res) => {
  res.redirect(302, `http://${req.hostname}/redirect`);
});
httpsApp.get('/reset', (req, res) => {
  res.setHeader('strict-transport-security', 'max-age=0;');
  res.end('HSTS reset');
})
httpsApp.get('/', (req, res) => {
  res.end(`
    <html>
    <head>
    </head>
    <body>
      <ul>
        <li>
          <a href="https://${req.hostname}/redirect">Escape redirect loop</a>
        </li>
        <li>
          <a href="http://${req.hostname}/">Downgrade</a>
        </li>
        <li>
          <a href="https://${req.hostname}/reset">Reset HSTS for <strong>${req.hostname}</strong></a>
        </li>
      </ul>
    </body>
    </html>
  `);
})

if (!fs.existsSync(pemPath)) {
  
}

const cert = fs.readFileSync(pemPath);
const options = { key: cert, cert };

http.createServer(httpApp).listen(80);
https.createServer(options, httpsApp).listen(443);


