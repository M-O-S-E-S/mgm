

DROP TABLE `migrations`;
DROP TABLE `estateban`;
DROP TABLE `estate_groups`;
DROP TABLE `estate_managers`;
DROP TABLE `estate_map`;
DROP TABLE `estate_settings`;
DROP TABLE `estate_users`;
DROP TABLE `iniConfig`;
DROP TABLE `offlineMessages`;
DROP TABLE `summaries`;

ALTER TABLE `hosts` DROP COLUMN `cmd_key`;
ALTER TABLE `hosts` DROP COLUMN `status`;
ALTER TABLE `hosts` MODIFY `slots` char(10);
ALTER TABLE `hosts` ADD 'public_ip' char(15) AFTER 'slots';

UPDATE `regions` SET 'httpPort'=NULL WHERE 'isRunning'=0;

ALTER TABLE `regions` DROP COLUMN `consolePort`;
ALTER TABLE `regions` DROP COLUMN `consoleUname`;
ALTER TABLE `regions` DROP COLUMN `consolePass`;
ALTER TABLE `regions` DROP COLUMN `size`;
ALTER TABLE `regions` DROP COLUMN `isRunning`;
ALTER TABLE `regions` DROP COLUMN `status`;
ALTER TABLE `regions` DROP COLUMN `externalAddress`;

INSERT IGNORE INTO `mgmDb` (`version`, `description`) VALUES (3, '003-mgm.sql');