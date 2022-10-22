# erva
### ERVA Development &amp; Project Management

Welcome to the ERVA development GitHub Respository.

Click on the Projects page for both code-related Issues and business-level Issues.
The "Project Type View" will help you see the various "Issues" (or to-dos) organized by Category (such as Marketing, Coding, etc.), while the "Status View" will help you understand the current level of completion (or lack thereof) for each Issue.

## Let's make this happen!

"Database Schema.txt" contains the database tables and the column attributes of the database. Using this document, the database can be reconstructed from scratch, but any data that was once in the database will be lost.

## How to get this working locally

Clone via Git

Install https://nodejs.org/en/download/

Install https://www.postgresql.org/download/

Open up PostgreSQL Shell

CREATE DATABASE erva;
CREATE USER superuser WITH ENCRYPTED PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE erva TO superuser;

#Log into the newly-created erva database with the following command
\connect erva

#Now that you are connected to the erva database, you need to enter this data in. You can copy and paste all of the database schema in one go

Copy data from https://github.com/zekeuribe/erva/blob/main/database%20schema.txt into SQL Shell Console, by block

#Check this by using this command:
\dt tables;

#You should see 8 rows listed

#Copy and paste all of the following lines as well

Copy data from https://github.com/zekeuribe/erva/blob/main/database%20schema.txt into SQL Shell Console

Add the following into SQL Shell, one by one:

insert into accounttypes (at_name) values ('government');

insert into accounttypes (at_name) values ('enterprise');

insert into accounttypes (at_name) values ('administrator');

insert into accounttypes (at_name) values ('generic');

insert into roles (roles_name) values ('manager');

insert into roles (roles_name) values ('user');

#Check to see if this worked by using the command
SELECT * from accounttypes;

#You should see 4 rows listed