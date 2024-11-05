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
        $('a.has-text-black').each((index, element) => {
            const title = $(element).text().trim();
            const href = $(element).attr('href');
            
            if (title && href) {
                if (!isFirstEntry) stream.write(',\n');
                stream.write(JSON.stringify({ title, href }, null, 2));
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
