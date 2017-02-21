CREATE SCHEMA `devicelog` ;

CREATE USER `logger`@`%` IDENTIFIED BY '142536';
GRANT INSERT,SELECT,UPDATE ON devicelog.* TO `logger`@`%`;
