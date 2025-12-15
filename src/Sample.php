<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "student_grading_system";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>  