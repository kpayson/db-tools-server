# Dockerfile for MySQL container
FROM mysql:latest

# Set the root password
ENV MYSQL_ROOT_PASSWORD=root

# Copy the SQL script to create the database schema
COPY schema.sql /docker-entrypoint-initdb.d/

# Expose port 3306
EXPOSE 3336

# Start MySQL
CMD ["mysqld"]