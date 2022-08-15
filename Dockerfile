FROM node:9.11.1-alpine
# install simple http server for serving static content
WORKDIR .
# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./
# install project dependencies
RUN yarn install
# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY . .
# build app for production with minification
RUN yarn ui-watch
RUN yarn api-watch
EXPOSE 8080
EXPOSE 4000
