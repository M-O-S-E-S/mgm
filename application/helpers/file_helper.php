<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

function serveFile($file, $name = null){
    $fileName = basename($file);
    if($name){
        $fileName = $name;
    }
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename='.$fileName);
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    ob_clean();
    flush();
    readfile($file);
    exit;
}

function osJoin($left, $right){
    $left = rtrim($left,DIRECTORY_SEPARATOR);
    $right = ltrim($right,DIRECTORY_SEPARATOR);
    return $left . DIRECTORY_SEPARATOR . $right;
}

?>
