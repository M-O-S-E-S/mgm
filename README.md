# mgm

MOSES Grid Manager (mgm) is a php/javascript application that is used to manage users and regions on a MOSES Opensimulator grid.  Mgm is designed to work together with an installation of Simiangrid, mgmNode, and Opensimulator to create an easy to manage virtual environment.  Simiangrid and MGM should be on the same host, while the database and mgmNode may be located on other hosts.

# Upgrading

If your copy of MGM is newer than tag 1.0, you upgrade MGM by doing the following:
1. git pull/checkout to update your local code base
1. Visit /install.html on your MGM application.  The installation code performs any mysql updates during the isntallation check.
1. Done

Depending on your host, you may need to empty your browser cache to view the updates.

If your copy of MGM is older than tag 1.0, then I am very sorry, but 1.0 is the oldest version that performs version tracking and database migration.  If you cannot reinstall but insist on migrating, you should examine the .sql files under server/files and diff them to your current version to apply the necessary changes.

# Installation

## Ubuntu 14.04 LTS

Mgm and mgmNode have been built and tested on Ubuntu server instances.  Please note that if you are installing mgmNode on the same host, mgmNode requires the latest Ubuntu version to pick up newer packages.

### Required packages

php5 php5-common php5-gd php5-mcrypt php-pear php-mail php5-mysql php5-xmlrpc

### Installation
1. Install required packages
1. Clone mgm into /var/www/html
1. Enable apache-mod-rewrite `a2enmod rewrite`
1. Create directory /var/www/html/maps
1. Create directory /var/www/html/archives
1. Create mysql database credentials for mgm, and opensim accounts
1. Copy /var/www/html/mgm/server/application/config/database.php.example to /var/www/html/mgm/server/application/contif/database.php
1. Update database.php config file with mgm and opensim credentials
1. Copy /var/www/html/mgm/server/application/config/mgm.php.example to /var/www/html/mgm/server/application/config/mgm.php
1. Update mgm.php with your deployment-specifics, such as simiangrid url, email credentials, etc
1. Modify your apache file, making the following changes:
    1. Change your DocumentRoot to /var/www/html/mgm
    1. Add Alias `Alias /maps /var/www/html/maps`
    1. Add Alias `Alias /Grid /var/www/html/simiangrid/Grid`
    1. Add Alias `Alias /GridLogin /var/www/html/simiangrid/GridLogin`
    1. Add Alias `Alias /GridPublic /var/www/html/simiangrid/GridPublic`
1. Chown /var/www/html content to www-data, and ensure proper apache permissions
1. Update /etc/php.ini, setting timezone
```php
date.timezone = "America/New_York
```
1. Install Simiangrid
    1. Visit [ip address]/Grid/install.php in a web browser
    1. Ensure proper packages are installed, and correct database credentials are inserted
    1. Repeat for [ip address]/GridLogin/install.php and [ip address]/GridPublic/install.php
1. Edit simiangrid config Grid/config/config.php
```php
$config["map_path"] = "/var/www/html/maps/";
```
1. Edit simiangrid config GridLogin/config/config.php
```php
$config['map_service'] = "[ip of webserver]/maps";
```
1. install mgm by visiting (ip)/install.html using your web-browser
1. Follow directions to create initial, and administrative avatar account

From this point, you should set up your mgmNode instances

## Centos 6 / RedHat
Mgm and mgmNode have been deployed on Centos 6

### required packages

httpd mod_ssl python-cherrypy python-psutil python-requests pyOpenSSL php php-common php-gd php-mcrypt php-pear php-pecl-memcache php-mhash php-mysql php-xml php-pear-Mail php-bcmath php-xmlrpc mysql-server

### Installation
1. Enable EPEL repository
```bash
rpm -ivh http://mirror.pnl.gov/epel/6/i386/epel-release-6-8.noarch.rpm
```
1. Install required packages
1. Create directory /var/www/html/maps
1. Create directory /var/www/html/archives
1. Clone mgm into /var/www/html/mgm
1. Modify /etc/my.conf, add `max_allowed_packet=16M` under `[mysqld]`
1. Restart mysql
1. Create mysql database credentials for mgm, and opensim accounts
1. Copy /var/www/mgm/server/application/config/database.php.example to /var/www/mgm/server/application/contif/database.php
1. Update database.php config file with mgm and opensim credentials
1. Load /var/www/mgm/mgm.sql into the mgm database
```bash
mysql -u mgmUname -pmgmPword mgmTable < mgm.sql
```
1. Copy /var/www/mgm/server/application/config/mgm.php.example to /var/www/mgm/server/application/config/mgm.php
1. Update mgm.php with your deployment-specifics, such as simiangrid url, email credentials, etc
1. Modify your apache file, making the following changes:
    1. Change your DocumentRoot to /var/www/html/mgm
    1. Add Alias `Alias /maps /var/www/html/maps`
    1. Add Alias `Alias /maps /var/www/html/simiangrid/Grid`
    1. Add Alias `Alias /GridLogin /var/www/simiangrid/GridLogin`
    1. Add Alias `Alias /GridPublic /var/www/simiangrid/GridPublic`
1. Chown /var/www/html content to apache, and ensure proper permissions and selinux labelling for webcontent
1. Start apache, and allow ports 80 and 443 tcp through iptables
1. Update /etc/php.ini, setting timezone
```php
date.timezone = "America/New_York
```
1. Install Simiangrid
    1. Visit [ip address]/Grid/install.php in a web browser
    1. Ensure proper packages are installed, and correct database credentials are inserted
    1. Repeat for [ip address]/GridLogin/install.php and [ip address]/GridPublic/install.php
1. Edit simiagrid confi Grid/config.config.php
```php
$config["map_path"] = "/var/www/html/maps/";
```
1. Edit simiangrid config GridLogin/config/config.php
```php
$config['map_service'] = "[ip of webserver]/maps";
```
1. install mgm by visiting (ip)/install.html using your web-browser
1. Follow directions to create initial, and administrative avatar account

## Windows Server
Mgm and mgmNode have been deployed on Windows with IIS, but instructions are not included here
