FROM node:lts

WORKDIR /app

COPY package*.json ./
RUN npm install 

COPY public ./public

COPY . .
EXPOSE 8080

CMD ["npm", "start"]