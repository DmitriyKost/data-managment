# docker build -t scraper-image .
# docker run -d --restart always --name scraper-container scraper-image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "scrape.js"]
