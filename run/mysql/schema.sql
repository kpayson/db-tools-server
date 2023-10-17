CREATE DATABASE IF NOT EXISTS dbTools;
USE dbTools;

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'root';

-- jdbc:mysql://localhost:3306/db?allowPublicKeyRetrieval=true&useSSL=false