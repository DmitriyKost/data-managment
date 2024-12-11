const fs = require('fs');
const path = require('path');
const { News, NewsHistory, sequelize } = require('./models');

async function processJsonFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const source = path.basename(filePath, '.json');

    for (const entry of data) {
        const [news, created] = await News.findOrCreate({
            where: {
                title: entry.title,
                author: entry.author || null,
            },
            defaults: {
                href: entry.href,
                source: source,
                source_url: entry.source_url,
                timestamp: new Date(),
            },
        });

        if (created) {
            await NewsHistory.create({
                news_id: news.id,
                change_type: 'INSERT',
            });
        }
    }
}

module.exports = {
    processJsonFile,
};
