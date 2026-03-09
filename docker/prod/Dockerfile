FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./

# to install only those dependencies u alr have in the pkg.json
RUN npm ci

COPY . .

RUN npm run build

# 2nd step of docker
FROM node:18-alpine as production


ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY --from=builder /app/dist ./

EXPOSE 5500

CMD ['node', "src/server.js"]