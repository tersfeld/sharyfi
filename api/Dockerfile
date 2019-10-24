FROM node:10-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY . .

RUN yarn

EXPOSE 8080

# start app
CMD ["node", "server.js"]