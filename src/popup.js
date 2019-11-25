/// <reference path="../node_modules/web-ext-types/global/index.d.ts" />

import * as browser from 'webextension-polyfill';

const blockHttpCheckbox = document.querySelector("#blockHttp");

setImmediate(async function() {
  const storage = await browser.storage.sync.get('blockHttp');
  blockHttpCheckbox.checked = storage.blockHttp;
});

blockHttpCheckbox.addEventListener('change', async function(e) {
  browser.storage.sync.set({
    blockHttp: e.target.checked,
  });

  const background = await browser.runtime.getBackgroundPage();
  background.blockHttpDowngrades = e.target.checked;
});
