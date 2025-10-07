# Base image for Node.js
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy both backend and frontend package.json and install dependencies
COPY ./backend/package*.json ./backend/
COPY ./track-points-app/package*.json ./track-points-app/

# Install dependencies for both backend and frontend
RUN cd backend && npm install
RUN cd track-points-app && npm install

# Install 'concurrently' to run both frontend and backend at the same time
RUN npm install -g concurrently prompt-sync mysql2

# Install mysql client
RUN apt-get update && apt-get install -y default-mysql-client


# Copy the rest of the application code
COPY ./backend ./backend
COPY ./track-points-app ./track-points-app
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh


# Make the entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose the ports for both backend and frontend
EXPOSE 3000 5173

# Entrypoint script to initialize database and tables
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Command to run both backend and frontend concurrently
CMD ["concurrently", "cd backend && npm start", "cd track-points-app && npm run dev"]
