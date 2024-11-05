const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const response = await superagent.get('https://www.lastampa.it');
        const $ = cheerio.load(response.text);
        const dir = './scraped';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const jsonFilePath = path.join(dir, 'LaStampa.json');
        const stream = fs.createWriteStream(jsonFilePath, { flags: 'w' });
        stream.write('[\n');
        let isFirstEntry = true;
        $('article a[href]').each((index, element) => {
            const link = $(element);
            const article = link.closest('article');
            if (article.length > 0) {
                const authorElement = article.find('span.entry__author');
                if (!isFirstEntry) stream.write(',\n');
                stream.write(JSON.stringify({
                    title: link.text().trim(),
                    href: link.attr('href'),
                    author: authorElement.length > 0 ? authorElement.text().trim() : 'Не найден'
                }, null, 2));

                isFirstEntry = false;
            }
        });
        stream.write('\n]');
        stream.end();

        console.log(`Data successfully saved to ${jsonFilePath}`);
    } catch (error) {
        console.error('Error:', error);
    }
})();
