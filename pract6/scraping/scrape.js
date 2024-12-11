const ANSA = require('./ANSA.js');
const LaStampa = require('./LaStampa.js');
const LaRepubblica = require('./LaRepubblica.js');
const IlSole24Ore = require('./IlSole24Ore.js');
const CorriereDellaSera = require('./CorriereDellaSera.js');
const save = require('./database/migration.js');
const stats = require('./stats.js')

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
    await getStatistics();
}

module.exports = {
    scrapeAndSave,
};
