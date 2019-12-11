/* SQLEditor (MySQL (2))*/


DROP TABLE IF EXISTS `accounts`;

DROP TABLE IF EXISTS `service_providers`;

CREATE TABLE IF NOT EXISTS `service_providers`
(
`service_provider_sid` CHAR(36) NOT NULL UNIQUE ,
`name` VARCHAR(255) NOT NULL UNIQUE ,
`description` VARCHAR(255),
`root_domain` VARCHAR(255) UNIQUE ,
`registration_hook` VARCHAR(255),
`hook_basic_auth_user` VARCHAR(255),
`hook_basic_auth_password` VARCHAR(255),
PRIMARY KEY (`service_provider_sid`)
) ENGINE=InnoDB COMMENT='An organization that provides communication services to its ';

CREATE TABLE IF NOT EXISTS `accounts`
(
`account_sid` CHAR(36) NOT NULL UNIQUE ,
`name` VARCHAR(255) NOT NULL,
`sip_realm` VARCHAR(255) UNIQUE ,
`service_provider_sid` CHAR(36) NOT NULL,
`registration_hook` VARCHAR(255),
`hook_basic_auth_user` VARCHAR(255),
`hook_basic_auth_password` VARCHAR(255),
PRIMARY KEY (`account_sid`)
) ENGINE=InnoDB COMMENT='A single end-user of the platform';
