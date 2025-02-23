
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .



ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
    
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    udev \
    ttf-freefont \
    chromium \
    && npm install puppeteer@1.10.0

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# https://stackoverflow.com/questions/77903578/how-to-use-puppeteer-in-docker-node20-alpine
## https://dev.to/cloudx/how-to-use-puppeteer-inside-a-docker-container-568c 
# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
