const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`BROWSER ${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.log(`BROWSER EXCEPTION: ${exception}`);
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/');
  
  console.log('Waiting for 5 seconds...');
  await page.waitForTimeout(5000);
  
  // Try to click into the design details to trigger the 3d view if it's not on the main page.
  // Wait, DesignDetails is shown when config.purpose === 'emergency_shelter' or something?
  // Let's see what the initial page is.
  console.log('Closing browser...');
  await browser.close();
})();
