FROM node:lts

WORKDIR /app

COPY package.json requirements.txt ./

RUN npm install

COPY public ./public
COPY data ./data

COPY index.js ./

RUN npm run start &