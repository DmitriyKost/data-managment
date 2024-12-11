const express = require('express');
const path = require('path');
const app = express();
const stats = require('./scraping/stats.js');
const cron = require('node-cron'); 
const scrape = require('./scraping/scrape.js')
const fs = require('fs');

console.log("Data will be scraped every day at midnight");
cron.schedule('0 0 * * *', async () => {
    await scrape.scrapeAndSave();
});

app.use(express.static(path.join(__dirname, 'static')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/api/statistics', async (req, res) => {
    try {
        const data = await getTodayStats();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

async function getTodayStats() {
    try {
        if (fs.existsSync('todayStats.json')) {
            const data = fs.readFileSync('todayStats.json', 'utf-8');
            return JSON.parse(data);
        } else {
            await stats.getStatistics();
            const data = fs.readFileSync('todayStats.json', 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading file or regenerating data:', error);
        throw error;
    }
}

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
