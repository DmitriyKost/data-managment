const { Op, Sequelize } = require('sequelize');
const { News } = require('./database/models');
const fs = require('fs');

async function getStatistics() {
    const statistics = await News.findAll({
        attributes: [
            'source',
            [
                Sequelize.fn('AVG', Sequelize.literal(
                    `CASE 
            WHEN LENGTH(title) - LENGTH(REPLACE(title, ' ', '')) + 1 > 0 
            THEN LENGTH(title) - LENGTH(REPLACE(title, ' ', '')) + 1
            ELSE 0
          END`
                )),
                'average_title_length_in_words'
            ],
            [
                Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN author IS NULL THEN 1 ELSE NULL END")),
                'no_author_count'
            ],
            [
                Sequelize.fn('COUNT', Sequelize.literal('DISTINCT id')),
                'unique_records_count'
            ],
            [
                Sequelize.fn('COUNT', Sequelize.col('id')),
                'total_records'
            ]
        ],
        group: ['source'],
    });

    const formattedStats = statistics.map(stat => {
        const noAuthorCount = stat.get('no_author_count');
        const totalRecords = stat.get('total_records');
        const noAuthorPercentage = totalRecords > 0 ? (noAuthorCount / totalRecords) * 100 : 0;

        return {
            source: stat.get('source'),
            average_title_length_in_words: stat.get('average_title_length_in_words'),
            no_author_percentage: noAuthorPercentage,
            unique_records_count: stat.get('unique_records_count'),
        };
    });

    const sourceOrder = {
        'IlSole24Ore': 1,
        'LaRepubblica': 2,
        'LaStampa': 3,
        'CorriereDellaSera': 4,
        'ANSA': 5
    };

    const avgLengthArray = [];
    const noAuthorArray = [];
    const uniqueRecordsArray = [];

    formattedStats.forEach(stat => {
        avgLengthArray[sourceOrder[stat.source] - 1] = stat.average_title_length_in_words;
        noAuthorArray[sourceOrder[stat.source] - 1] = stat.no_author_percentage;
        uniqueRecordsArray[sourceOrder[stat.source] - 1] = stat.unique_records_count;
    });

    const statisticsData = {
        average_title_length_in_words: avgLengthArray,
        no_author_percentage: noAuthorArray,
        unique_records_count: uniqueRecordsArray
    };

    fs.writeFileSync('todayStats.json', JSON.stringify(statisticsData, null, 2));
    return formattedStats;
}

module.exports = {
    getStatistics,
}
