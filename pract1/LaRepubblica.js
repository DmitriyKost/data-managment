const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        await page.goto('https://www.repubblica.it', { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            const results = [];
            const newsLinks = document.querySelectorAll('article a[href]');
            newsLinks.forEach(link => {
                const article = link.closest('article');
                const author = article ? article.querySelector('span.entry__author') : null;
                results.push({
                    title: link.innerText.trim(),
                    href: link.href,
                    author: author ? author.textContent.trim() : "Не найден"
                });
            });
            return results;
        });

        const workbook = XLSX.utils.book_new();

        const worksheetData = data.map(item => [item.title, item.href, item.author]);
        const worksheet = XLSX.utils.aoa_to_sheet([['Title', 'Link', 'Author'], ...worksheetData]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'News Data');
        XLSX.writeFile(workbook, './scraped/LaRepubblica.xlsx');
    } catch (error) {
        console.error('Error during Puppeteer operation:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
