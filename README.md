mgm
===

MOSES Grid Manager (mgm) is a php/javascript application that is used to manage users and regions on a MOSES Opensimulator grid.  Mgm is designed to work together with an installation of Simiangrid, mgmNode, and Opensimulator to create an easy to manage virtual environment.  In fact, for full functionality Simiangrid and mgm should be on the same machine.


Installation
---
Mgm has been tested on IIS/Windows Server, but we recommend LAMP, so directions below are for debin/centos installation.  Simiangrid must already be installed, as mgm interfaces with Simmiangrid for important functions.

required packages:
`php php-common php-gd php-mcrypt php-pear php-pecl-memcache php-mhash php-mysql php-xml php-pear-Mail php-bcmath php-xmlrpc`
    
Clone mgm into /var/www (/var/www/html on centos/rhel)

Enable apache-mod-rewrite

Create directory /var/www/maps

Create mysql database credentials for mgm, and opensim accounts

Copy /var/www/mgm/application/config/database.php.example to /var/www/mgm/application/contif/database.php

Update database.php config file with mgm and opensim credentials

Load /var/www/mgm/mgm.sql into the mgm database

Copy /var/www/mgm/application/config/mgm.php.example to /var/www/mgm/application/config/mgm.php

Update mgm.php with your deployment-specifics, such as simiangrid url, email credentials, etc

Change your apache webroot to /var/www/mgm

Visit (ip)/install using your web-browser

Follow directions to create initial, and administrative avatar account

From this point, you should set up your mgmNode instances

