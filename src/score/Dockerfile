FROM node:lts

WORKDIR /app

COPY ./package.json ./
RUN npm install 

COPY public ./public

COPY score.js ./

CMD ["node", "score.js"]