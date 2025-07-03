# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Expose the app's port (change if different)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
