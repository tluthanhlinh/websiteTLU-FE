<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// include database and object files
include_once '../../config/Database.php';
include_once '../../models/User.php';

// instantiate database and user object
$database = new Database();
$db = $database->connect();

// initialize object
$user = new User($db);

// get posted data
$data = json_decode(file_get_contents("php://input"));

// set product id to be deleted
$user->id = $data->id ?? null;

// delete the user
if ($user->id && $user->delete()) {
    // set response code - 200 OK
    http_response_code(200);
    // tell the user
    echo json_encode(array("message" => "User was deleted."));
} else {
    // set response code - 503 service unavailable
    http_response_code(503);
    // tell the user
    echo json_encode(array("message" => "Unable to delete user. The user ID is missing or an error occurred."));
}
?>