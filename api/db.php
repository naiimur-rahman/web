<?php
$host = "localhost";
$dbname = "uiu_ta_management";
$username = "root";
$password = "1234";

$pdo = new PDO(
    "mysql:host=$host;
    dbname=$dbname;
    charset=utf8mb4",
    $username,
    $password);
?>
