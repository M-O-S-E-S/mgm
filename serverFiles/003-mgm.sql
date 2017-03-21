

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

ALTER TABLE `hosts` DROP 'cmd_key';
ALTER TABLE `hosts` DROP 'status';
ALTER TABLE `hosts` MODIFY 'slots' char(10);
ALTER TABLE `hosts` ADD 'public_ip' char(15) AFTER 'slots';

ALTER TABLE `regions` DROP 'consolePort';
ALTER TABLE `regions` DROP 'consoleUname';
ALTER TABLE `regions` DROP 'consolePass';
ALTER TABLE `regions` DROP 'size';
ALTER TABLE `regions` DROP 'isRunning';
ALTER TABLE `regions` DROP 'status';

UPDATE `regions` SET 'httpPort'=NULL WHERE 'isRunning'=0;

INSERT IGNORE INTO `mgmDb` (`version`, `description`) VALUES (3, '003-mgm.sql');