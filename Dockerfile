FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY build ./build

CMD ["node", "build/index.js"]
