FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Evita prompt de analytics
ENV NG_CLI_ANALYTICS=false

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll=2000"]
