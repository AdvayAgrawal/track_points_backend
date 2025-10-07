#!/bin/bash

# Wait for the MySQL service to be available
until mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; do
  result=$(mysql -h"$MYSQL_HOST" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1")
  echo "$result"
  echo "Waiting for MySQL to be available..."
  sleep 2
done

# Run the database setup
echo "Database setup..."
node backend/db-setup.js

# # Run the data initialization script
echo "Initialize data..."
node backend/initialize-data.js

echo "Running application now..."
# Execute the CMD (concurrently running backend and frontend)
exec "$@"
