const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('https://prognosel-mobile.vercel.app/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/landing-desktop.png', fullPage: true });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('https://prognosel-mobile.vercel.app/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/landing-mobile.png', fullPage: true });

  await browser.close();
  console.log('Screenshots saved to /tmp/landing-desktop.png and /tmp/landing-mobile.png');
})();
