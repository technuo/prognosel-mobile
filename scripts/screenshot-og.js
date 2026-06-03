const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  const filePath = require('path').resolve(__dirname, 'og-image.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle' });

  // Wait for fonts to load
  await page.waitForTimeout(1000);

  await page.screenshot({ path: require('path').resolve(__dirname, '../public/og-image.png'), type: 'png' });

  await browser.close();
  console.log('OG image saved to public/og-image.png');
})();
