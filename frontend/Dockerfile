FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
ARG APP_NAME=frontend
COPY --from=build /app/dist/${APP_NAME}/browser/ /usr/share/nginx/html/
EXPOSE 80
