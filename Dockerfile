# Use an official Node.js runtime as a parent image
FROM node:20

# Set the NODE_ENV environment variable to production to match the production settings in config.json
ENV NODE_ENV=production

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build


# Copy the wait-for-it.sh script to the container
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /app/wait-for-it.sh

# Make the wait-for-it.sh script executable
RUN chmod +x /app/wait-for-it.sh

RUN apt-get update && apt-get install -y netcat-openbsd

RUN apt-get install bash

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:wait"]
# CMD ["npm", "run", "start:prod"]
#CMD sh -c 'tail -f /dev/null'
