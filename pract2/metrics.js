const fs = require('fs');
const path = require('path');

const files = [
    'scraped/LaStampa.json',
    'scraped/ANSA.json',
    'scraped/CorriereDellaSera.json',
    'scraped/IlSole24Ore.json',
    'scraped/LaRepubblica.json'
];

const calculateMetrics = (records) => {
    const totalRecords = records.length;

    const uniqueRecords = new Set(records.map(record => record.href)).size;

    const allTitles = records.map(record => record.title).join(' ');
    const wordsArray = allTitles.match(/\w+/g); // Разделение на слова
    const uniqueWords = new Set(wordsArray);
    const uniqueWordsCount = uniqueWords.size;

    const titleLengths = records
        .map(record => record.title.split(' ').length)
        .filter(length => length > 0);
    
    const minLength = titleLengths.length > 0 ? Math.min(...titleLengths) : 0;
    const maxLength = titleLengths.length > 0 ? Math.max(...titleLengths) : 0;
    const averageLength = titleLengths.length > 0 
        ? (titleLengths.reduce((sum, len) => sum + len, 0) / titleLengths.length) 
        : 0;

    // Медиана
    titleLengths.sort((a, b) => a - b);
    const medianLength = titleLengths.length > 0 
        ? (titleLengths.length % 2 === 0 
            ? (titleLengths[titleLengths.length / 2 - 1] + titleLengths[titleLengths.length / 2]) / 2 
            : titleLengths[Math.floor(titleLengths.length / 2)])
        : 0;

    // Доля пропусков по каждому атрибуту
    const missingAuthors = records.filter(record => !record.author || record.author === 'Не найден').length;
    const missingTitles = records.filter(record => !record.title).length;

    const missingAuthorsRatio = (missingAuthors / totalRecords) * 100;
    const missingTitlesRatio = (missingTitles / totalRecords) * 100;

    console.log(`Общее количество записей: ${totalRecords}`);
    console.log(`Количество уникальных записей: ${uniqueRecords}`);
    console.log(`Количество уникальных слов в заголовках: ${uniqueWordsCount}`);
    console.log(`Минимальная длина заголовка: ${minLength} слов`);
    console.log(`Максимальная длина заголовка: ${maxLength} слов`);
    console.log(`Средняя длина заголовков: ${averageLength.toFixed(2)} слов`);
    console.log(`Медианная длина заголовков: ${medianLength} слов`);
    console.log(`Доля записей без авторов: ${missingAuthorsRatio.toFixed(2)}%`);
    console.log(`Доля записей без заголовков: ${missingTitlesRatio.toFixed(2)}%`);
};

const processFiles = () => {
    files.forEach(file => {
        const filePath = path.join(__dirname, file);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Ошибка при чтении файла ${file}:`, err);
                return;
            }
            try {
                const records = JSON.parse(data);
                console.log(`Метрики для ${file}:`);
                calculateMetrics(records);
                console.log('\n');
            } catch (parseError) {
                console.error(`Ошибка при парсинге JSON из файла ${file}:`, parseError);
            }
        });
    });
};

processFiles();
