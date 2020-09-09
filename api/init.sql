CREATE DATABASE reviews;
GRANT ALL PRIVILEGES ON DATABASE reviews TO postgres;

CREATE DATABASE supersecretgoogleapidb;
CREATE USER googleapiuser;
GRANT ALL PRIVILEGES ON DATABASE supersecretgoogleapidb TO googleapiuser;
