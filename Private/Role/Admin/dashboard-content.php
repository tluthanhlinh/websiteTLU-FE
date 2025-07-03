<?php
// frontend/Private/Role/Admin/dashboard-content.php

// Bật báo cáo lỗi để dễ dàng gỡ lỗi trong quá trình phát triển
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CẬP NHẬT ĐƯỜNG DẪN KẾT NỐI DATABASE ĐẾN Database.php
// Đường dẫn tương đối từ frontend/Private/Role/Admin/dashboard-content.php
// -> ../ (ra khỏi Admin) -> frontend/Private/Role/
// -> ../ (ra khỏi Role) -> frontend/Private/
// -> ../ (ra khỏi Private) -> frontend/
// -> ../backend/config/Database/Database.php (đi vào backend/config/Database rồi đến Database.php)
require_once __DIR__ . '/../../../../backend/config/Database/Database.php';

// Khởi tạo các biến để lưu trữ dữ liệu sẽ được hiển thị
$totalUsers = "N/A";
$totalMembers = "N/A";
$totalLeaders = "N/A";
$upcomingActivities = "N/A";
$newAnnouncements = "N/A";
$totalArticles = "N/A";
$numAdmins = "N/A";
$numBosses = "N/A";
$recentActivities = ['Không thể tải hoạt động gần đây.']; // Giá trị mặc định

try {
    // Kiểm tra nếu biến $conn (từ Database.php) đã được khởi tạo thành công
    if (!isset($conn) || !$conn instanceof PDO) {
        throw new Exception("Biến kết nối database (\$conn) không tồn tại hoặc không hợp lệ. Kiểm tra Database.php.");
    }

    // --- LẤY DỮ LIỆU ĐỘNG TỪ DATABASE ---
    // (Bạn cần đảm bảo các bảng và cột này tồn tại trong database của bạn)

    // Tổng số tài khoản người dùng
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users");
    $stmt->execute();
    $totalUsers = $stmt->fetchColumn();

    // Tổng số Đoàn sinh (giả định có bảng 'members')
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM members");
    $stmt->execute();
    $totalMembers = $stmt->fetchColumn();

    // Tổng số Huynh trưởng / GLV (giả định có bảng 'leaders')
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM leaders");
    $stmt->execute();
    $totalLeaders = $stmt->fetchColumn();

    // Hoạt động sắp tới (ví dụ: đếm các hoạt động có ngày trong tương lai)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM activities WHERE activity_date >= CURDATE()");
    $stmt->execute();
    $upcomingActivities = $stmt->fetchColumn();

    // Tin tức / Thông báo mới (ví dụ: đếm các tin tức trong 7 ngày gần nhất)
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM news WHERE created_at >= CURDATE() - INTERVAL 7 DAY");
    $stmt->execute();
    $newAnnouncements = $stmt->fetchColumn();

    // Tổng số Bài viết (giả định từ bảng 'news' hoặc 'articles')
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM news");
    $stmt->execute();
    $totalArticles = $stmt->fetchColumn();

    // Số lượng Admin (từ bảng users, cột role='admin')
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'admin'");
    $stmt->execute();
    $numAdmins = $stmt->fetchColumn();

    // Số lượng Boss (từ bảng users, cột role='boss')
    $stmt = $conn->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'boss'");
    $stmt->execute();
    $numBosses = $stmt->fetchColumn();

    // Lấy hoạt động gần đây (ví dụ: 5 hoạt động gần nhất từ bảng 'activity_log')
    // Giả định có bảng activity_log với cột 'description' và 'created_at'
    $stmt = $conn->prepare("SELECT description FROM activity_log ORDER BY created_at DESC LIMIT 5");
    $stmt->execute();
    $recentActivities = $stmt->fetchAll(PDO::FETCH_COLUMN);
    if (empty($recentActivities)) {
        $recentActivities = ['Không có hoạt động gần đây trong database.'];
    }


} catch (PDOException $e) {
    // Xử lý lỗi PDO (database)
    error_log("PDOException in dashboard-content.php: " . $e->getMessage());
    // Đặt giá trị lỗi cho các biến nếu có lỗi database
    $totalUsers = $totalMembers = $totalLeaders = $upcomingActivities = $newAnnouncements = $totalArticles = $numAdmins = $numBosses = "Lỗi DB";
    $recentActivities = ['Không thể tải hoạt động gần đây do lỗi database: ' . htmlspecialchars($e->getMessage())];
    // Hiển thị thông báo lỗi trực tiếp trên trang nếu đang debug
    echo "<div style='color: red; padding: 10px; border: 1px solid red; background-color: #ffe0e0; margin: 10px 0;'>Lỗi database: " . htmlspecialchars($e->getMessage()) . "</div>";

} catch (Exception $e) {
    // Xử lý các lỗi PHP khác (ví dụ: biến không tồn tại)
    error_log("Exception in dashboard-content.php: " . $e->getMessage());
    $totalUsers = $totalMembers = $totalLeaders = $upcomingActivities = $newAnnouncements = $totalArticles = $numAdmins = $numBosses = "Lỗi";
    $recentActivities = ['Không thể tải hoạt động gần đây do lỗi server: ' . htmlspecialchars($e->getMessage())];
    echo "<div style='color: red; padding: 10px; border: 1px solid red; background-color: #ffe0e0; margin: 10px 0;'>Lỗi server: " . htmlspecialchars($e->getMessage()) . "</div>";
}

// Không có thẻ đóng PHP ?>
