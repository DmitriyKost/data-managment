const superagent = require('superagent');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:79.0) Gecko/20100101 Firefox/79.0',
];

const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));

const fetchPage = async (url) => {
    const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    try {
        const response = await superagent
            .get(url)
            .set('User-Agent', userAgent)
            .timeout({ response: 5000, deadline: 10000 });
        await delay(1000, 3000);
        return response;
    } catch (error) {
        console.error(`Error fetching ${url}: ${error.message}`);
        await delay(3000, 5000);
        throw error;
    }
};

(async () => {
    try {
        const response = await fetchPage('https://www.repubblica.it');
        const $ = cheerio.load(response.text);

        const dir = './scraped';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const jsonFilePath = path.join(dir, 'LaRepubblica.json');
        const stream = fs.createWriteStream(jsonFilePath, { flags: 'w' });
        stream.write('[\n');
        let isFirstEntry = true;

        let navigationLinks = [];
        $('div.ls-page-header__panel__navigation')
            .find('ul.ls-page-header__panel__menu__links a')
            .each((_, link) => {
                const href = $(link).attr('href');
                if (href) {
                    const fullLink = href.startsWith('http') ? href : `https://www.lastampa.it${href}`;
                    navigationLinks.push({ href: fullLink, text: $(link).text().trim() });
                }
            });

        navigationLinks = navigationLinks.filter((value, index, self) =>
            self.findIndex(link => link.href === value.href) === index
        );
        console.log(`Found ${navigationLinks.length} navigation links.`);

        for (const navLink of navigationLinks) {
            try {
                console.log(`Parsing section: ${navLink.href}`);

                const sectionResponse = await fetchPage(navLink.href);
                const section$ = cheerio.load(sectionResponse.text);

                section$('article a[href]').each((_, element) => {
                    const link = $(element);
                    const article = link.closest('article');
                    const authorElement = article.find('span.entry__author');

                    if (!isFirstEntry) stream.write(',\n');
                    stream.write(JSON.stringify({
                        title: link.text().trim(),
                        href: link.attr('href'),
                        author: authorElement.length > 0 ? authorElement.text().trim() : 'Не найден'
                    }, null, 2));

                    isFirstEntry = false;
                });
            } catch (error) {
                console.error(`Error parsing section ${navLink.href}: ${error.message}`);
                continue;
            }
        }

        stream.write('\n]');
        stream.end();

        console.log(`Data successfully saved to ${jsonFilePath}`);
    } catch (error) {
        console.error('Error during the scraping process:', error);
    }
})();
