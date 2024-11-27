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
        const response = await fetchPage('https://www.corriere.it');
        const $ = cheerio.load(response.text);

        const dir = './scraped';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const jsonFilePath = path.join(dir, 'CorriereDellaSera.json');
        const stream = fs.createWriteStream(jsonFilePath, { flags: 'w' });

        stream.write('[\n');
        let isFirstEntry = true;

        let sectionLinks = [];
        sectionLinks.push('https://www.corriere.it');
        $('div.container').each((_, container) => {
            $(container).find('li.submenu-list-item a.submenu-link').each((_, aElement) => {
                const sectionLink = $(aElement).attr('href');
                if (sectionLink) {
                    const fullLink = sectionLink.startsWith('http') ? sectionLink : `https://www.corriere.it${sectionLink}`;
                    sectionLinks.push(fullLink);
                }
            });
        });

        sectionLinks = sectionLinks.filter((value, index, self) => self.indexOf(value) === index);
        console.log(`Found ${sectionLinks.length} sections to parse.`);

        for (const sectionLink of sectionLinks) {
            try {
                console.log(`Parsing section: ${sectionLink}`);
                const sectionResponse = await fetchPage(sectionLink);
                const section$ = cheerio.load(sectionResponse.text);

                section$('.media-news__content').each((_, newsContainer) => {
                    const titleElement = section$(newsContainer).find('h4.title-art-hp a.has-text-black');
                    const authorElement = section$(newsContainer).find('.author-art');
                    const href = titleElement.attr('href');
                    const title = titleElement.text().trim();
                    const author = authorElement.text().trim() || null;

                    if (title && href) {
                        const newsData = { 
                            title, 
                            href, 
                            author, 
                            source_url: sectionLink 
                        };
                        if (!isFirstEntry) stream.write(',\n');
                        stream.write(JSON.stringify(newsData, null, 2));
                        isFirstEntry = false;
                    }
                });
            } catch (error) {
                console.error(`Error fetching section ${sectionLink}: ${error.message}`);
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
