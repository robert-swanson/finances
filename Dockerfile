FROM node:14
# install simple http server for serving static content
WORKDIR /ui-app
# copy both 'package.json' and 'package-lock.json' (if available)
COPY package.json ./
COPY yarn.lock ./
# install project dependencies
RUN yarn install
# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY .. .
# build app for production with minification
CMD ["yarn", "ui-watch"]