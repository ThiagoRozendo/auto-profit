FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prisma:generate
RUN npm run build

CMD ["sh", "-c", "npm run prisma:migrate:deploy && npm run start:prod"]
