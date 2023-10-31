FROM node:20

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm i

ENV PATH /usr/node_modules/.bin:$PATH

COPY . .

ENV NODE_OPTIONS --max-old-space-size=32768

RUN npm run build

EXPOSE 3000