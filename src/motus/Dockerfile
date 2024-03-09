FROM node:lts

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY public ./public

COPY . .
EXPOSE 8080

CMD ["npm", "start"]