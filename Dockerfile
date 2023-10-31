FROM node:20

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm i

ENV PATH /usr/node_modules/.bin:$PATH

COPY . .

EXPOSE 3000