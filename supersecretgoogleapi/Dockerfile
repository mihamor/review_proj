FROM node:10

ENV GOOGLE_API_PORT=${GOOGLE_API_PORT}
ENV DATABASE_URL=${DATABASE_URL}

# Create app directory
WORKDIR /usr/src/api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE ${GOOGLE_API_PORT}
CMD ["yarn", "run", "dev"]
