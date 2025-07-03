<?php
// required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// include database and object files
include_once '../../config/Database.php';
include_once '../../models/User.php';

// instantiate database and user object
$database = new Database();
$db = $database->connect();

// initialize object
$user = new User($db);

// region: PAGINATION and SEARCH/FILTER
// Get pagination parameters from the URL
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = 10; // Number of records per page
$offset = ($page - 1) * $limit;

// Get search and filter terms from the URL
$searchTerm = isset($_GET['search']) ? $_GET['search'] : '';
$roleFilter = isset($_GET['role']) ? $_GET['role'] : '';
$statusFilter = isset($_GET['status']) ? $_GET['status'] : '';
// endregion

// read users
// This method needs to be implemented in User.php
$result = $user->read($limit, $offset, $searchTerm, $roleFilter, $statusFilter);

// Check if records are found
if ($result && $result['count'] > 0) {
    $users_arr = array();
    $users_arr["users"] = array();

    // retrieve our table contents
    // fetch() is faster than fetchAll()
    // http://stackoverflow.com/questions/2770630/pdofetchall-vs-pdofetch-in-a-loop
    while ($row = $result['stmt']->fetch(PDO::FETCH_ASSOC)) {
        // extract row
        // this will make $row['name'] to just $name
        extract($row);

        $user_item = array(
            "id" => $id,
            "username" => $username,
            "email" => $email,
            "role" => $role,
            "status" => $status,
            "created_at" => $created_at
            // Do not expose password or sensitive information!
        );

        array_push($users_arr["users"], $user_item);
    }

    // calculate total pages
    $total_records = $result['total_count'];
    $total_pages = ceil($total_records / $limit);
    
    // add pagination info to the response
    $users_arr["total_pages"] = $total_pages;
    $users_arr["current_page"] = $page;
    $users_arr["total_records"] = $total_records;

    // set response code - 200 OK
    http_response_code(200);

    // show products data in json format
    echo json_encode($users_arr);
} else {
    // set response code - 404 Not found
    http_response_code(404);

    // tell the user no products found
    echo json_encode(
        array("message" => "No users found.", "users" => [])
    );
}

// Ensure the connection is closed
$database->close();
?>