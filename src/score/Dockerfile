FROM node:lts

WORKDIR /app

COPY ./package.json ./
RUN npm install --production

COPY public ./public

COPY score.js ./

CMD ["node", "score.js"]