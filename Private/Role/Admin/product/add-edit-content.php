<?php
// frontend/Private/Role/Admin/product/add-edit-content.php (sẽ đổi tên thành content-type chung hơn)
// CHỈ CHỨA NỘI DUNG FORM THÊM/SỬA BÀI VIẾT/TIN TỨC

// Đường dẫn tương đối từ Private/Role/Admin/product/add-edit-content.php đến Database/db.php
include_once '../../../../Database/db.php'; 

$item_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$item = [ // Đổi tên biến từ $product thành $item
    'id' => '',
    'title' => '', // Tên bài viết
    'author' => '', // Tác giả
    'content' => '', // Nội dung
    'image_url' => '', // Ảnh đại diện
    'status' => 'draft', // Trạng thái: draft, published
    'category' => '' // Danh mục (ví dụ: news, events, reflections)
];
$form_title = "Thêm bài viết mới";

if ($item_id > 0) {
    try {
        if (isset($conn) && $conn instanceof PDO) {
            // Thay thế 'products' bằng tên bảng phù hợp (ví dụ: 'articles')
            // và các cột cho phù hợp (title, author, content, image_url, status, category)
            $stmt = $conn->prepare("SELECT id, title, author, content, image_url, status, category FROM articles WHERE id = :id"); 
            $stmt->bindParam(':id', $item_id, PDO::PARAM_INT);
            $stmt->execute();
            $fetched_item = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($fetched_item) {
                $item = $fetched_item;
                $form_title = "Sửa bài viết: " . htmlspecialchars($item['title']);
            } else {
                $form_title = "Bài viết không tồn tại, đang thêm mới";
                $item_id = 0; // Reset ID if not found
            }
        }
    } catch (PDOException $e) {
        error_log("Error fetching content for edit: " . $e->getMessage());
        $form_title = "Lỗi khi tải bài viết, đang thêm mới";
        $item_id = 0;
    }
}
?>

<div id="content-add-edit-main-content" class="admin-form-container">
    <h2><?= $form_title ?></h2>
    <form id="contentForm" action="" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="id" value="<?= htmlspecialchars($item['id']) ?>">
        
        <label for="title">Tiêu đề bài viết:</label>
        <input type="text" id="title" name="title" value="<?= htmlspecialchars($item['title']) ?>" required>

        <label for="author">Tác giả:</label>
        <input type="text" id="author" name="author" value="<?= htmlspecialchars($item['author']) ?>" required>

        <label for="category">Danh mục:</label>
        <select id="category" name="category" required>
            <option value="">Chọn danh mục</option>
            <option value="news" <?= ($item['category'] == 'news') ? 'selected' : '' ?>>Tin tức</option>
            <option value="events" <?= ($item['category'] == 'events') ? 'selected' : '' ?>>Sự kiện</option>
            <option value="reflections" <?= ($item['category'] == 'reflections') ? 'selected' : '' ?>>Suy niệm</option>
            <!-- Thêm các danh mục khác nếu cần -->
        </select>

        <label for="content">Nội dung:</label>
        <textarea id="content" name="content" rows="10" required><?= htmlspecialchars($item['content']) ?></textarea>

        <label for="image">Ảnh đại diện:</label>
        <input type="file" id="image" name="image" accept="image/*">
        <?php if (!empty($item['image_url'])): ?>
            <p>Ảnh hiện tại:</p>
            <?php 
                // Đường dẫn tương đối từ Private/Role/Admin/product/add-edit-content.php đến hình ảnh
                // Giả định image_url trong DB là "uploads/content_images/abc.jpg"
                $currentImageUrl = '../../../../' . htmlspecialchars($item['image_url']);
            ?>
            <img src="<?= $currentImageUrl ?>" alt="Current Image" style="max-width: 150px; height: auto; margin-top: 10px; margin-bottom: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <?php endif; ?>

        <label for="status">Trạng thái:</label>
        <select id="status" name="status" required>
            <option value="draft" <?= ($item['status'] == 'draft') ? 'selected' : '' ?>>Bản nháp</option>
            <option value="published" <?= ($item['status'] == 'published') ? 'selected' : '' ?>>Xuất bản</option>
        </select>

        <div class="form-actions">
            <button type="submit"><?= ($item_id > 0) ? 'Cập nhật' : 'Thêm mới' ?></button>
            <button type="button" class="cancel-btn">Hủy</button>
        </div>
    </form>
</div>
