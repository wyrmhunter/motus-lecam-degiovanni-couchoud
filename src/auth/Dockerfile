FROM node:lts

WORKDIR /app

COPY package.json requirements.txt ./

RUN npm install

COPY public ./public

COPY auth.js ./

RUN npm run start &