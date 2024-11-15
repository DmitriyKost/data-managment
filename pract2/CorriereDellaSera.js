const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const response = await superagent.get('https://www.corriere.it');
        const $ = cheerio.load(response.text);
        const dir = './scraped';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const jsonFilePath = path.join(dir, 'CorriereDellaSera.json');
        const stream = fs.createWriteStream(jsonFilePath, { flags: 'w' });
        stream.write('[\n');
        let isFirstEntry = true;
        $('.media-news__content').each((index, newsContainer) => {
            const titleElement = $(newsContainer).find('h4.title-art-hp a.has-text-black');
            const authorElement = $(newsContainer).find('.author-art');
            const href = titleElement.attr('href');
            const title = titleElement.text().trim();
            const author = authorElement.text().trim() || 'Не найден'; 

            if (title && href) {
                const newsData = { title, href, author };
                if (!isFirstEntry) stream.write(',\n');
                stream.write(JSON.stringify(newsData, null, 2));
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
