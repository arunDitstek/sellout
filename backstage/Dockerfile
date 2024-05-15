FROM node:13.11.0

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Set up private npm registry
ARG SELLOUT_NPM_AUTH_TOKEN
ARG FONTAWESOME_NPM_AUTH_TOKEN

COPY .npmrc .npmrc

# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install react-scripts@3.4.4 -g
COPY . ./

# Delete .npmrc
RUN rm -rf .npmrc

RUN npm run build
CMD npm run production