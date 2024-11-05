const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        const response = await superagent.get('https://www.ilsole24ore.com');
        const $ = cheerio.load(response.text);
        const dir = './scraped';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        const jsonFilePath = path.join(dir, 'IlSole24Ore.json');
        const stream = fs.createWriteStream(jsonFilePath, { flags: 'w' });
        stream.write('[\n');
        let isFirstEntry = true;
        $('h3.aprev-title').each((index, element) => {
            const link = $(element).find('a');
            if (link.length > 0) {
                let author = null;
                let sibling = $(element).next();
                while (sibling.length > 0) {
                    if (sibling.is('p.auth')) {
                        author = sibling;
                        break;
                    }
                    sibling = sibling.next();
                }
                if (!author) {
                    let parent = $(element).parent();
                    while (parent.length > 0) {
                        author = parent.find('p.auth').first();
                        if (author.length > 0) break;
                        parent = parent.parent();
                    }
                }
                if (!isFirstEntry) stream.write(',\n');
                stream.write(JSON.stringify({
                    title: link.text().trim(),
                    href: link.attr('href'),
                    author: author ? author.text().trim() : 'Не найден'
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
