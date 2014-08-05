CREATE TABLE IF NOT EXISTS `estateban` (
  `EstateID` int(10) unsigned NOT NULL,
  `bannedUUID` varchar(36) NOT NULL,
  `bannedIp` varchar(16) NOT NULL,
  `bannedIpHostMask` varchar(16) NOT NULL,
  `bannedNameMask` varchar(64) DEFAULT NULL,
  KEY `estateban_EstateID` (`EstateID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `estate_groups` (
  `EstateID` int(10) unsigned NOT NULL,
  `uuid` char(36) NOT NULL,
  KEY `EstateID` (`EstateID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `estate_managers` (
  `EstateID` int(10) unsigned NOT NULL,
  `uuid` char(36) NOT NULL,
  KEY `EstateID` (`EstateID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `estate_map` (
  `RegionID` char(36) NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
  `EstateID` int(11) NOT NULL,
  PRIMARY KEY (`RegionID`),
  KEY `EstateID` (`EstateID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `estate_settings` (
  `EstateID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `EstateName` varchar(64) DEFAULT NULL,
  `AbuseEmailToEstateOwner` tinyint(4) NOT NULL,
  `DenyAnonymous` tinyint(4) NOT NULL,
  `ResetHomeOnTeleport` tinyint(4) NOT NULL,
  `FixedSun` tinyint(4) NOT NULL,
  `DenyTransacted` tinyint(4) NOT NULL,
  `BlockDwell` tinyint(4) NOT NULL,
  `DenyIdentified` tinyint(4) NOT NULL,
  `AllowVoice` tinyint(4) NOT NULL,
  `UseGlobalTime` tinyint(4) NOT NULL,
  `PricePerMeter` int(11) NOT NULL,
  `TaxFree` tinyint(4) NOT NULL,
  `AllowDirectTeleport` tinyint(4) NOT NULL,
  `RedirectGridX` int(11) NOT NULL,
  `RedirectGridY` int(11) NOT NULL,
  `ParentEstateID` int(10) unsigned NOT NULL,
  `SunPosition` double NOT NULL,
  `EstateSkipScripts` tinyint(4) NOT NULL,
  `BillableFactor` float NOT NULL,
  `PublicAccess` tinyint(4) NOT NULL,
  `AbuseEmail` varchar(255) NOT NULL,
  `EstateOwner` varchar(36) NOT NULL,
  `DenyMinors` tinyint(4) NOT NULL,
  `AllowLandmark` tinyint(4) NOT NULL DEFAULT '1',
  `AllowParcelChanges` tinyint(4) NOT NULL DEFAULT '1',
  `AllowSetHome` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`EstateID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=129 ;

CREATE TABLE IF NOT EXISTS `estate_users` (
  `EstateID` int(10) unsigned NOT NULL,
  `uuid` char(36) NOT NULL,
  KEY `EstateID` (`EstateID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `hosts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` char(15) NOT NULL,
  `port` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `cmd_key` char(36) NOT NULL DEFAULT '0000',
  `slots` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `address` (`address`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=22 ;

CREATE TABLE IF NOT EXISTS `hostStats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `host` int(11) NOT NULL,
  `status` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `timestamp` (`timestamp`,`host`),
  KEY `host` (`host`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3863810 ;

CREATE TABLE IF NOT EXISTS `iniConfig` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `region` text NOT NULL,
  `section` text NOT NULL,
  `item` text NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=535 ;

CREATE TABLE IF NOT EXISTS `jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` varchar(255) NOT NULL,
  `user` char(36) NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=137 ;

CREATE TABLE IF NOT EXISTS `migrations` (
  `name` varchar(100) DEFAULT NULL,
  `version` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `offlineMessages` (
  `uuid` varchar(36) CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  `message` text CHARACTER SET latin1 COLLATE latin1_general_ci NOT NULL,
  KEY `uuid` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `regionLogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `region` char(36) NOT NULL,
  `message` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `region` (`region`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=35201 ;

CREATE TABLE IF NOT EXISTS `regions` (
  `uuid` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `size` tinyint(6) NOT NULL DEFAULT '1',
  `httpPort` int(11) DEFAULT NULL,
  `consolePort` int(11) DEFAULT NULL,
  `consoleUname` char(36) NOT NULL DEFAULT '0000',
  `consolePass` char(36) NOT NULL DEFAULT '0000',
  `locX` int(11) DEFAULT NULL,
  `locY` int(11) DEFAULT NULL,
  `externalAddress` text,
  `slaveAddress` char(15) DEFAULT NULL,
  `isRunning` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`uuid`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `regionStats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `region` char(36) NOT NULL,
  `status` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `timestamp` (`timestamp`,`region`),
  KEY `region` (`region`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=61213315 ;

CREATE TABLE IF NOT EXISTS `summaries` (
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `gender` char(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `registered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `summary` text NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


ALTER TABLE `hostStats`
  ADD CONSTRAINT `hostStats_ibfk_1` FOREIGN KEY (`host`) REFERENCES `hosts` (`id`) ON DELETE CASCADE;

ALTER TABLE `regionLogs`
  ADD CONSTRAINT `regionLogs_ibfk_1` FOREIGN KEY (`region`) REFERENCES `regions` (`uuid`) ON DELETE CASCADE;

ALTER TABLE `regionStats`
  ADD CONSTRAINT `regionStats_ibfk_1` FOREIGN KEY (`region`) REFERENCES `regions` (`uuid`) ON DELETE CASCADE;
