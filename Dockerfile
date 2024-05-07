# Stage 1: Build the React Application
FROM node:latest as build
WORKDIR /app/front
COPY front/package*.json ./
# RUN npm install
# RUN npm install --registry=https://npm.iranrepo.ir/
RUN apt-get update && apt-get install -y curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

COPY . .
RUN npm run build

# # Stage 2: Setup the Nginx Server to serve the React Application
# FROM nginx:alpine as production
# COPY --from=build /app/front/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]


# FROM node:alpine as build

# WORKDIR /app/front
# COPY ./front .

# RUN npm install
# RUN npm run build

# FROM ubuntu
# RUN apt-get update
# RUN apt-get install nginx -y
# COPY --from=build /app/front/dist /var/www/html/
# EXPOSE 80
# CMD ["nginx","-g","daemon off;"]

# https://github.com/mattburrell/vite-react-docker/blob/main/Dockerfile
