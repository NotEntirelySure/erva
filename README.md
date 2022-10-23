#Enter the following command into the postgres SQL shell prompt:

CREATE DATABASE erva;
CREATE USER superuser WITH ENCRYPTED PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE erva TO superuser;
GRANT ALL ON SCHEMA public TO superuser;

#Log into the newly-created erva database with the following command:

\CONNECT erva

#Now that you are connected to the erva database, you need to enter this data in. You can copy and paste all of the database schema in one go

CREATE EXTENSION pgcrypto;

CREATE TABLE roles (
	roles_id SERIAL PRIMARY KEY,
	roles_name VARCHAR
);

CREATE TABLE accounttypes (
	at_id SERIAL PRIMARY KEY,
	at_name VARCHAR
);

CREATE TABLE users (
	users_id SERIAL PRIMARY KEY,
	users_fk_role INT REFERENCES roles(roles_id),
	users_fk_type INT REFERENCES accounttypes(at_id),
	users_first_name VARCHAR,
	users_last_name VARCHAR,
	users_email TEXT NOT NULL UNIQUE,
	users_password TEXT NOT NULL,
	users_otp_key TEXT NOT NULL,
	users_created_at TIMESTAMP,
	users_enabled BOOLEAN
);

CREATE TABLE offices (
	offices_id SERIAL PRIMARY KEY,
	offices_image BYTEA,
	offices_name VARCHAR,
	offices_address VARCHAR,
	offices_city VARCHAR,
	offices_state VARCHAR,
	offices_zip INT
);

CREATE TABLE facilities (
	facilities_id SERIAL PRIMARY KEY,
	facilities_fk_offices INT REFERENCES offices(offices_id),
	facilities_name VARCHAR,
	facilities_address VARCHAR,
	facilities_city VARCHAR,
	facilities_state VARCHAR,
	facilities_zip INT,
	facilities_image VARCHAR
);

CREATE TABLE facilitypermissions (
	fp_id SERIAL PRIMARY KEY,
	fp_fk_user INT REFERENCES users(users_id),
	fp_fk_facility INT REFERENCES facilities(facilities_id)
);

CREATE TABLE maps (
	maps_id SERIAL PRIMARY KEY,
	maps_fk_facility_id INT REFERENCES facilities(facilities_id),
	maps_name VARCHAR,
	maps_code VARCHAR,
	maps_image VARCHAR
);

CREATE TABLE access_log (
	access_log_id SERIAL PRIMARY KEY,
	access_log_user_id INT,
	access_log_map_id INT,
	access_log_timestamp TIMESTAMP
);

#Check that the tables were successfully created by using this command: 

\dt tables;

#You should see 8 rows listed

#Copy and paste all of the following lines as well

INSERT INTO accounttypes (at_name) values ('government');
INSERT INTO accounttypes (at_name) values ('enterprise');
INSERT INTO accounttypes (at_name) values ('administrator');
INSERT INTO accounttypes (at_name) values ('generic');
INSERT INTO roles (roles_name) values ('manager');
INSERT INTO roles (roles_name) values ('user');

#Check to see if this worked by using the command SELECT * from accounttypes;

#You should see 4 rows listed
