
DROP TABLE IF EXISTS `hostStats`, `regionStats`, `regionLogs`;

ALTER TABLE  `regions` ADD  `status` TEXT NOT NULL ;
ALTER TABLE  `hosts` ADD  `status` TEXT NOT NULL ;

INSERT IGNORE INTO `mgmDb` (`version`, `description`) VALUES (1, '001-mgm.sql');
