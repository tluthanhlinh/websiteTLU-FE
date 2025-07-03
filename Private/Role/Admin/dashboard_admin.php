<?php
// frontend/Private/Role/Admin/dashboard_admin.php

// Bắt đầu session nếu chưa được khởi tạo.
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Bật báo cáo lỗi (chỉ trong môi trường phát triển)
if (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1); // Hiển thị lỗi ra màn hình
} else {
    error_reporting(E_ALL); 
    ini_set('display_errors', 0); // Không hiển thị lỗi trên production
    ini_set('log_errors', 1); 
    // Đảm bảo thư mục logs/ tồn tại và có quyền ghi
    ini_set('error_log', __DIR__ . '/../../../../backend/logs/php_error.log'); 
}

// --- KIỂM TRA XÁC THỰC VÀ PHÂN QUYỀN ---
if (!isset($_SESSION['username']) || !isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    // Đường dẫn này cần chính xác từ dashboard_admin.php đến login.html
    header('Location: ../../../Public/Login.html'); 
    exit; // Dừng script sau khi chuyển hướng
}

// --- KHỞI TẠO KẾT NỐI DATABASE ---
// ĐẶC BIỆT QUAN TRỌNG: Đảm bảo đường dẫn này chính xác
// Từ frontend/Private/Role/Admin/ lùi 4 cấp để về thư mục gốc, rồi vào backend/config/Database/
require_once __DIR__ . '/../../../../backend/config/Database/Database.php';

$db = null; // Khởi tạo biến $db ban đầu là null
$errorMessage = null; // Biến để lưu thông báo lỗi database

try {
    $database = new Database();
    $db = $database->getConnection(); // Lấy kết nối

    if ($db === null) {
        // Nếu getConnection() trả về null, nghĩa là có lỗi kết nối bên trong Database.php
        $errorMessage = "Lỗi kết nối database: Vui lòng kiểm tra cấu hình trong Database.php và trạng thái máy chủ.";
        error_log("Lỗi: dashboard_admin.php không nhận được kết nối DB hợp lệ từ Database.php.");
    }

} catch (Exception $e) {
    // Bắt bất kỳ ngoại lệ nào trong quá trình khởi tạo Database
    $errorMessage = "Lỗi khởi tạo database: " . htmlspecialchars($e->getMessage());
    error_log("Lỗi khởi tạo database trong dashboard_admin.php: " . $e->getMessage());
    $db = null; // Đảm bảo $db là null nếu có lỗi
}

// --- KHỞI TẠO CÁC BIẾN SỐ LIỆU TỔNG QUAN ---
// Định nghĩa tất cả các biến PHP mà HTML sử dụng với giá trị mặc định
$totalUsers = 0;
$totalMembers = 0;
$totalLeaders = 0;
$upcomingActivities = 0;
$newAnnouncements = 0;
$totalArticles = 0;
$numAdmins = 0;
$numBosses = 0;

// --- LẤY DỮ LIỆU TỔNG QUAN TỪ DATABASE ---
// CHỈ THỰC HIỆN TRUY VẤN NẾU $db KHÔNG PHẢI LÀ NULL (kết nối thành công)
if ($db !== null) {
    try {
        $stmt = $db->query("SELECT COUNT(*) FROM users");
        $totalUsers = $stmt->fetchColumn();

        $stmt = $db->query("SELECT COUNT(*) FROM members");
        $totalMembers = $stmt->fetchColumn();
        
        $stmt = $db->query("SELECT COUNT(*) FROM leaders");
        $totalLeaders = $stmt->fetchColumn();

        $stmt = $db->query("SELECT COUNT(*) FROM activities WHERE start_date >= CURDATE()");
        $upcomingActivities = $stmt->fetchColumn();

        $stmt = $db->query("SELECT COUNT(*) FROM news WHERE created_at >= CURDATE() - INTERVAL 7 DAY");
        $newAnnouncements = $stmt->fetchColumn();
        
        // Cần bảng 'posts' hoặc 'articles' để đếm
        $stmt = $db->query("SELECT COUNT(*) FROM posts"); // <<< Cần thay 'posts' nếu tên bảng khác (ví dụ: articles)
        $totalArticles = $stmt->fetchColumn();

        $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
        $numAdmins = $stmt->fetchColumn();

        $stmt = $db->query("SELECT COUNT(*) FROM users WHERE role = 'boss'"); // <<< Cần thay 'boss' nếu vai trò khác
        $numBosses = $stmt->fetchColumn();

    } catch (PDOException $e) {
        $errorMessage = "Lỗi khi lấy dữ liệu tổng quan: " . htmlspecialchars($e->getMessage());
        error_log("Lỗi khi lấy dữ liệu tổng quan trong dashboard_admin.php: " . $e->getMessage());
        // Các biến sẽ giữ giá trị mặc định là 0
    }
} else {
    // Nếu $db là null (kết nối thất bại), đặt thông báo lỗi để hiển thị trên HTML
    if ($errorMessage === null) { // Tránh ghi đè lỗi kết nối ban đầu
         $errorMessage = "Lỗi server: Không có kết nối database để tải dữ liệu. Vui lòng kiểm tra lại.";
    }
}

// --- NHÚNG GIAO DIỆN HTML ---
// Hiển thị thông báo lỗi nếu có
if ($errorMessage !== null && ini_get('display_errors')) { // Chỉ hiển thị lỗi nếu display_errors bật
    echo "<div style='color: red; padding: 10px; border: 1px solid red; background-color: #ffe0e0; margin: 10px;'>" . $errorMessage . "</div>";
} else if ($errorMessage !== null) { // Nếu display_errors tắt, chỉ hiện thông báo chung
    echo "<div style='color: red; padding: 10px; border: 1px solid red; background-color: #ffe0e0; margin: 10px;'>Đã xảy ra lỗi hệ thống. Vui lòng kiểm tra log lỗi.</div>";
}

// Bây giờ, các biến PHP đã được định nghĩa và có thể sử dụng trong file HTML.
include 'dashboard_admin.html'; 
?>
