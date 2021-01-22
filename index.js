const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // All places for sale
  // await page.goto('https://opensea.io/assets/cryptovoxels?search[sortAscending]=false&search[sortBy]=LISTING_DATE');

  // Current places for sale
    await page.goto('https://opensea.io/assets/cryptovoxels?search[sortAscending]=false&search[sortBy]=LISTING_DATE&search[toggles][0]=FOR_SALE');

    // Infinite Scrolling Stuff, maybe clean up later, forloop scope would be limited though
    var i;
    for (i = 0; i <= 50000; i = i + 5000) {
      await page.evaluate(`window.scrollTo(0, ${i})`);
      await page.waitForTimeout(5000 + (i * 0.15));
    }
    const prices = await page.$$eval('div[class="Pricereact__DivContainer-t54vn5-0 lfnLj Price--main Asset--price-amount"] > div', anchors => { return anchors.map(anchor => anchor.textContent) })
    const titles = await page.$$eval('div.Asset--name', anchors => { return anchors.map(anchor => anchor.textContent) })

    await browser.close()

    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: 'For_Sale_Cryptovoxel_Land.csv',
        header: [
            {id: 'assetName', title: 'Asset Name'},
            {id: 'assetPrice', title: 'Asset Price (ETH)'}
        ]
    });

    const records = [];

    for (var i = 0; i < titles.length; i++) {
        records.push({
            assetName: titles[i],
            assetPrice: prices[i]
        })
    }
    
    csvWriter.writeRecords(records)
        .then(() => {
            console.log('Created CSV');
        });
})();

