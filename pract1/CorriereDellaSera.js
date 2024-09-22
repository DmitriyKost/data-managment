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
            document.querySelectorAll('a.has-text-black').forEach(a => {
                results.push({
                    title: a.innerText.trim(),
                    href: a.href
                });
            });
            return results;
        });

        const workbook = XLSX.utils.book_new();

        const worksheetData = data.map(item => [item.title, item.href]);
        const worksheet = XLSX.utils.aoa_to_sheet([['Title', 'Link'], ...worksheetData]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'News Data');
        XLSX.writeFile(workbook, './scraped/CorriereDellaSera.xlsx');
    } catch (error) {
        console.error('Ошибка при выполнении Puppeteer:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
