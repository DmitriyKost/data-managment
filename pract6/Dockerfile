FROM node:23

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the entire project into the working directory
COPY . .

# Expose the port that the Express app will run on
EXPOSE 8080

# Start the Express server and the cron job in the background
CMD ["node", "index.js"]

# docker build -t scraper-image .
# docker run -d --restart always --name scraper-container scraper-image
