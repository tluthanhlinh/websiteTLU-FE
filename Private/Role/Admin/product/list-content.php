<?php
// frontend/Private/Role/Admin/product/list-content.php
// CHỈ CHỨA NỘI DUNG TRANG QUẢN LÝ NỘI DUNG CHUNG (VÍ DỤ: BÀI VIẾT/TIN TỨC)

// Đường dẫn tương đối từ Private/Role/Admin/product/list-content.php đến Database/db.php
// (product/list-content.php -> product/ -> Admin/ -> Role/ -> Private/ -> Database/db.php)
include_once '../../../../Database/db.php'; 

// Giả định chúng ta sẽ quản lý "articles" hoặc "news"
// Điều chỉnh truy vấn này để lấy dữ liệu bài viết/tin tức/sự kiện thực tế của bạn
$items = []; // Đổi tên biến từ $products thành $items cho mục đích chung
try {
    if (isset($conn) && $conn instanceof PDO) {
        // Ví dụ: Lấy danh sách bài viết/tin tức
        // Bạn cần có bảng 'articles' hoặc 'news' trong database của mình
        // Thay thế 'articles' bằng tên bảng phù hợp (ví dụ: 'news', 'events', 'posts')
        // Đảm bảo các cột 'id', 'title', 'author', 'created_at', 'status' tồn tại hoặc thay đổi cho phù hợp
        $stmt = $conn->query("SELECT id, title, author, created_at, status FROM articles ORDER BY created_at DESC"); 
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
} catch (PDOException $e) {
    error_log("Error fetching content list for admin: " . $e->getMessage());
    $items = [];
}
?>

<div id="content-list-main-content">
    <h3 class="section-title">📝 Quản lý Bài viết / Tin tức</h3>

    <a href="product/add-edit-content.php" class="add-new-btn" data-admin-page-script="initContentAddEditPage">Thêm bài viết mới</a>

    <div class="admin-table-container">
        <?php if (empty($items)): ?>
            <p class="no-products-message">Chưa có bài viết/tin tức nào trong hệ thống.</p>
        <?php else: ?>
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu đề</th>
                        <th>Tác giả</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($items as $item): ?>
                        <tr>
                            <td><?= htmlspecialchars($item['id']) ?></td>
                            <td><?= htmlspecialchars($item['title']) ?></td>
                            <td><?= htmlspecialchars($item['author']) ?></td>
                            <td><?= htmlspecialchars(date('d/m/Y H:i', strtotime($item['created_at']))) ?></td>
                            <td><?= htmlspecialchars($item['status']) ?></td>
                            <td class="action-buttons">
                                <a href="product/add-edit-content.php?id=<?= $item['id'] ?>" class="btn-edit" data-admin-page-script="initContentAddEditPage">Sửa</a>
                                <button class="btn-delete" data-item-id="<?= $item['id'] ?>">Xóa</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>
