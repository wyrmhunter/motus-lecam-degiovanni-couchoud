FROM node:lts

WORKDIR /app

COPY ./package.json ./
RUN npm install --production

COPY public ./public

COPY auth.js ./

CMD ["node", "auth.js"]