# Use Node.js 20.11.0 as base image
FROM node:20.11.0

# Create a directory for the app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000

RUN npm run build

# Start the application in development mode
CMD ["npm", "start"]