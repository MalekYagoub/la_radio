# étape de build
FROM node:lts-alpine as build-stage
WORKDIR /app

# créer  le fichier .env avec les variables d'environnement
RUN touch .env
RUN echo "VUE_APP_SERVER_URL='http://206.189.61.231:3000'" >> .env

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# étape de production
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]