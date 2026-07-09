# Dev-mode Dockerfile (npm run dev, with hot reload via volume mount in
# docker-compose). For an actual production image, switch to a multi-stage
# build with `npm run build` + `npm run start` instead - this one prioritizes
# "just works out of the box" for local full-stack development.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
