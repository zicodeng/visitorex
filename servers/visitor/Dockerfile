FROM node:alpine
WORKDIR /visitor
COPY . .
RUN npm install --only=prod
EXPOSE 80
ENTRYPOINT ["node", "index.js"]