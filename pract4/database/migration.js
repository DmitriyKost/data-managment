const { sequelize } = require('./models');
const { processJsonFile } = require('./utils');

const scraped = [
    'ANSA.json',
    'CorriereDellaSera.json',
    'IlSole24Ore.json',
    'LaRepubblica.json',
    'LaStampa.json',
];

async function saveToDB() {
    try {
        // await sequelize.sync(); // Uncomment if there's no database

        for (const file of scraped) {
            console.log(`Processing file: ${file}`);
            await processJsonFile('./scraped/' + file);
        }

        console.log('All files processed successfully.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
};

module.exports = {
    saveToDB,
};
