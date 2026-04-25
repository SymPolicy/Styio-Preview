const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:4181/styio-hyper-vis.html');
  await page.waitForTimeout(2000); // 等待 Canvas 动画开始
  await page.screenshot({ path: 'debug_screenshot.png' });
  await browser.close();
  console.log('Screenshot captured to debug_screenshot.png');
})();
