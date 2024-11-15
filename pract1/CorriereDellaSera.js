const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto('https://www.corriere.it', { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            const results = [];
            
            document.querySelectorAll('.media-news__content').forEach(newsContainer => {
                const titleElement = newsContainer.querySelector('h4.title-art-hp a.has-text-black');
                const authorElement = newsContainer.querySelector('.author-art');
                const linkElement = titleElement; 

                if (titleElement && linkElement) {
                    results.push({
                        title: titleElement.innerText.trim(),
                        href: linkElement.href,
                        author: authorElement ? authorElement.innerText.trim() : 'Не найден' 
                    });
                }
            });
            return results;
        });

        const workbook = XLSX.utils.book_new();
        const worksheetData = data.map(item => [item.title, item.href, item.author]);
        const worksheet = XLSX.utils.aoa_to_sheet([['Title', 'Link', 'Author'], ...worksheetData]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'News Data');
        XLSX.writeFile(workbook, './scraped/CorriereDellaSera.xlsx');
    } catch (error) {
        console.error('Error during Puppeteer execution:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
