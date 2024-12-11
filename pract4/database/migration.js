const { sequelize, TaskStatus } = require('./models');
const { processJsonFile } = require('./utils');

const scraped = [
    'ANSA.json',
    'CorriereDellaSera.json',
    'IlSole24Ore.json',
    'LaRepubblica.json',
    'LaStampa.json',
];

async function saveToDB() {
    const tables = await sequelize.getQueryInterface().showAllTables();
        if (tables.length === 0) {
            console.log('No tables found. Syncing the database...');
            await sequelize.sync();
        } else {
            console.log('Database already contains tables. Skipping sync.');
        }
    let taskStatus;
    try {
        taskStatus = await TaskStatus.create({
            task_name: 'scrapeToDB',
            status: 'In Progress',
            start_time: new Date(),
        });

        console.log('Task started. Processing files...');
        for (const file of scraped) {
            console.log(`Processing file: ${file}`);
            await processJsonFile('./scraped/' + file);
        }

        await taskStatus.update({
            status: 'Completed',
            end_time: new Date(),
            message: 'All files processed successfully.',
        });
    } catch (error) {
        if (taskStatus) {
            await taskStatus.update({
                status: 'Failed',
                end_time: new Date(),
                message: `Error: ${error.message}`,
            });
        }
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

module.exports = {
    saveToDB,
};
