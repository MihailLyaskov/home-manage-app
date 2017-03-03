

CREATE TABLE IF NOT EXISTS `devicelog`.`CLASS_TBL` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `CLASS_NAME` VARCHAR(45) NOT NULL,
  `VER` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC),
  UNIQUE INDEX `CLASS_NAME_UNIQUE` (`CLASS_NAME` ASC));

CREATE TABLE IF NOT EXISTS `devicelog`.`DEVICE_TBL` (
  `ID` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `DEV_NAME` VARCHAR(45) NOT NULL COMMENT '',
  `CLASS_ID` INT NOT NULL COMMENT '',
  `NETWORK_NAME` VARCHAR(45) NOT NULL COMMENT '',
  PRIMARY KEY (`ID`)  COMMENT '',
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC)  COMMENT '',
  UNIQUE INDEX `DEV_NAME_UNIQUE` (`DEV_NAME` ASC)  COMMENT '',
  CONSTRAINT `CLASS`
    FOREIGN KEY (`CLASS_ID`)
    REFERENCES `devicelog`.`CLASS_TBL` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE IF NOT EXISTS `devicelog`.`DATA_LOG_TBL` (
  `ID` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `DEV_ID` INT NOT NULL COMMENT '',
  `REAL_P` FLOAT NOT NULL COMMENT '',
  `ENERGY` FLOAT NOT NULL COMMENT '',
  `TIME` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '',
  PRIMARY KEY (`ID`)  COMMENT '',
  UNIQUE INDEX `ID_UNIQUE` (`ID` ASC)  COMMENT '',
  CONSTRAINT `DEVICE`
    FOREIGN KEY (`DEV_ID`)
    REFERENCES `devicelog`.`DEVICE_TBL` (`ID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


USE `devicelog`;
DROP procedure IF EXISTS `register_device`;

DELIMITER $$
USE `devicelog`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `register_device`(IN dev_n varchar(45),class_n varchar(45),class_v varchar(45),net_n varchar(70))
BEGIN
	declare class_id int;
  declare device_check int;

  select id into device_check
  from devicelog.DEVICE_TBL
  where DEV_NAME = dev_n;

  if device_check is null then

    select id into class_id
    from devicelog.CLASS_TBL
    where CLASS_NAME = class_n and VER = class_v;

    if class_id is not null then
		insert into devicelog.DEVICE_TBL
        (DEV_NAME,CLASS_ID,NETWORK_NAME)
        values (dev_n,class_id,net_n);
	  else
		  insert into devicelog.CLASS_TBL
      (CLASS_NAME,VER)
      values(class_n,class_v);

      insert into devicelog.DEVICE_TBL
      (DEV_NAME,CLASS_ID,NETWORK_NAME)
      values (dev_n,(select ID from CLASS_TBL where CLASS_NAME = class_n),net_n);
	  end if;

	select ID
    from DEVICE_TBL
    where DEV_NAME = dev_n;

   end if;
END$$

DELIMITER ;




USE `devicelog`;
DROP procedure IF EXISTS `show_devices`;

DELIMITER $$
USE `devicelog`$$
CREATE PROCEDURE `show_devices` ()
BEGIN

select DEV_NAME as Device , CLASS_NAME as Class , VER as ClassVer, NETWORK_NAME as Network
from DEVICE_TBL , CLASS_TBL
where DEVICE_TBL.CLASS_ID = CLASS_TBL.ID;

END$$

DELIMITER ;

USE `devicelog`;
DROP procedure IF EXISTS `log_data`;

DELIMITER $$
USE `devicelog`$$
CREATE PROCEDURE `log_data` (in device varchar(45), power float,energy float)
BEGIN

insert into DATA_LOG_TBL
(DEV_ID,REAL_P,ENERGY)
values ((select id from DEVICE_TBL where DEV_NAME = device),power,energy);

END$$

DELIMITER ;

USE `devicelog`;
DROP procedure IF EXISTS `get_data`;

DELIMITER $$
USE `devicelog`$$
CREATE PROCEDURE `get_data`(in dev_name varchar(20) , begin timestamp, end timestamp)
BEGIN
    select avg(REAL_P) as power , sum(ENERGY) as energy
    from devicelog.DATA_LOG_TBL
    where (TIME between begin and end) and DEV_ID = (select id from devicelog.DEVICE_TBL where DEV_NAME = dev_name);
END$$

DELIMITER ;

GRANT EXECUTE ON PROCEDURE devicelog.register_device TO 'logger'@'%';
GRANT EXECUTE ON PROCEDURE devicelog.log_data TO 'logger'@'%';
GRANT EXECUTE ON PROCEDURE devicelog.show_devices TO 'logger'@'%';
GRANT EXECUTE ON PROCEDURE devicelog.get_data TO 'logger'@'%';
