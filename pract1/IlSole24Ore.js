const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, 
        });
        const page = await browser.newPage();
        await page.goto('https://www.ilsole24ore.com', { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            const results = [];
            const newsHeaders = document.querySelectorAll('h3.aprev-title');

            newsHeaders.forEach(header => {
                const link = header.querySelector('a');
                if (link) {
                    let author = null;

                    let sibling = header.nextElementSibling;
                    while (sibling) {
                        if (sibling.matches('p.auth')) {
                            author = sibling;
                            break;
                        }
                        sibling = sibling.nextElementSibling;
                    }

                    if (!author) {
                        let parent = header.parentElement;
                        while (parent) {
                            author = parent.querySelector('p.auth');
                            if (author) break;
                            parent = parent.parentElement;
                        }
                    }

                    results.push({
                        title: link.innerText.trim(),
                        href: link.href,
                        author: author ? author.textContent.trim() : "Не найден"
                    });
                }
            });
            return results;
        });

        const workbook = XLSX.utils.book_new();

        const worksheetData = data.map(item => [item.title, item.href, item.author]);
        const worksheet = XLSX.utils.aoa_to_sheet([['Title', 'Link', 'Author'], ...worksheetData]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'News Data');
        XLSX.writeFile(workbook, './scraped/IlSole24Ore.xlsx');
    } catch (error) {
        console.error('Error during Puppeteer operation:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();

