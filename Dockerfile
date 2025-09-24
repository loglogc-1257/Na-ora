# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Make port 3500 available to the world outside this container
EXPOSE 3500

# Define the command to run the app
CMD ["npm", "run", "dev"]
