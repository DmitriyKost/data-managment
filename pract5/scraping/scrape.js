const cron = require('node-cron'); 
const ANSA = require('./ANSA.js');
const LaStampa = require('./LaStampa.js');
const LaRepubblica = require('./LaRepubblica.js');
const IlSole24Ore = require('./IlSole24Ore.js');
const CorriereDellaSera = require('./CorriereDellaSera.js');
const save = require("./database/migration.js");

async function runAllScrapers() {
    try {
        await Promise.all([
            ANSA.scrape(),
            LaRepubblica.scrape(),
            LaStampa.scrape(),
            IlSole24Ore.scrape(),
            CorriereDellaSera.scrape(),
        ]);
    } catch (error) {
        console.error('Error while running scrapers:', error);
    }
}

async function scrapeAndSave() {
    await runAllScrapers();
    await save.saveToDB();
}

console.log("Data will be scraped every day at midnight")
cron.schedule('0 0 * * *', async () => {
    scrapeAndSave();
});

module.exports = {
    scrapeAndSave,
};