# /src/server/Dockerfile

# Use an official Node.js runtime. 'slim' is smaller and better for production.
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker's layer caching.
# This way, 'npm install' only runs again if your dependencies change.
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application's source code
COPY . .

# Cloud Run provides the PORT environment variable.
# Your app should listen on process.env.PORT || 8080.
EXPOSE 8080

# The command to start your server.
# Replace 'server.js' with your actual entry file (e.g., index.js).
CMD ["sh", "-c", "npm run migrate && npm start"]
