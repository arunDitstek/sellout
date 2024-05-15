# FROM node:13.11.0
FROM node:14.17.0

# make source directory
RUN mkdir /service

# change working directory
WORKDIR /service

# Set up private npm registry
ARG SELLOUT_NPM_AUTH_TOKEN

# Copy package.json
COPY package.json package-lock.json .npmrc ./

# Install Deps
RUN npm install

# copy source code -- we do this step after the last two for build caching reasons
# see link below
# https://christianfei.com/posts/Cache-speed-up-docker-node-modules/
COPY . /service

# Delete .npmrc
RUN rm -f .npmrc

# install common dependency
RUN npm run build
WORKDIR /service/node_modules/@sellout/models

RUN echo "//registry.npmjs.org/:_authToken=${SELLOUT_NPM_AUTH_TOKEN}" > .npmrc
RUN npm install

# back to service folder
WORKDIR /service

CMD npm run start-production
