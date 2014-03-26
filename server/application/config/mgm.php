<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/* performance data is both performance statistics, as well as process logs */
$config['mgm_performanceDataRetentionDays']	= 10;
$config['mgm_uploadDownloadStorageArea'] = '/home/mheilman/html/archives/';
$config['mgm_adminEmail'] = 'mheilman@ist.ucf.edu';
$config['mgm_pathToSimianMapsFolder'] = '/home/mheilman/html/maps';

$config['gridInfo_gridName'] = 'MOSES GRID';
$config['gridInfo_gridNick'] = 'MOSES GRID';
$config['gridInfo_publicIP'] = 'stark';

$config['simian_groups_read_key'] = 'password123';
$config['simian_groups_write_key'] = 'password123';

$config['simian_gridUrl'] = 'http://stark/Grid/';
$config['mgm_internal_address'] = "http://stark/";

$config['registration_maleTemplate'] = 'MaleAvatar';
$config['registration_femaleTemplate'] = 'FemaleAvatar';
$config['mgm_hubRegion'] = 'ABWIS';
$config['voice_freeswitchHost'] = 'stark';

$config['email_host'] = 'ssl://mailrouter.us.army.mil';
$config['email_port'] = 465;
$config['email_username'] = 'arl.sttc.open.simulator';
$config['email_password'] = "ApriL252016!@#";
$config['email_sourceAddress'] = 'arl.sttc.open.simulator@us.army.mil';

/* End of file mgm.php */
/* Location: ./application/config/mgm.php */
