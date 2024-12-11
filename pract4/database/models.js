const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
});

const News = sequelize.define('News', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    href: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    author: {
        type: DataTypes.TEXT,
    },
    source: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    source_url: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

const NewsHistory = sequelize.define('NewsHistory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    news_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: News,
            key: 'id',
        },
    },
    change_type: {
        type: DataTypes.TEXT,
        allowNull: false, // "INSERT", "UPDATE", "DELETE"
    },
    change_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = {
    sequelize,
    News,
    NewsHistory,
};
