<?php
// This PHP block is a placeholder for server-side logic
// In a real application, you would handle this on the client-side with JavaScript.
$userId = isset($_GET['id']) ? (int)$_GET['id'] : null;
$pageTitle = $userId ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng Mới';
$formAction = $userId ? 'update_user' : 'create_user';
?>

<div class="user-form-section p-4">
    <h4><i class="fas fa-<?php echo $userId ? 'edit' : 'plus-circle'; ?> me-2"></i> <?php echo $pageTitle; ?></h4>
    <p class="text-muted">Nhập thông tin chi tiết của người dùng.</p>

    <div class="card shadow-sm rounded-3 border-0 mt-4">
        <div class="card-body">
            <form id="user-form" action="#" method="POST">
                <input type="hidden" name="action" value="<?php echo $formAction; ?>">
                <?php if ($userId): ?>
                    <input type="hidden" name="user_id" id="user_id" value="<?php echo htmlspecialchars($userId); ?>">
                <?php endif; ?>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="full_name" class="form-label">Họ và tên</label>
                        <input type="text" class="form-control" id="full_name" name="full_name" required>
                    </div>
                    <div class="col-md-6">
                        <label for="username" class="form-label">Tên tài khoản</label>
                        <input type="text" class="form-control" id="username" name="username" required <?php echo $userId ? 'readonly' : ''; ?>>
                        <?php if ($userId): ?>
                            <small class="text-muted">Tên tài khoản không thể thay đổi.</small>
                        <?php endif; ?>
                    </div>
                    <div class="col-md-6">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" name="email">
                    </div>
                    <div class="col-md-6">
                        <label for="password" class="form-label">Mật khẩu <?php echo $userId ? '<small class="text-muted">(Để trống nếu không đổi)</small>' : ''; ?></label>
                        <input type="password" class="form-control" id="password" name="password" <?php echo $userId ? '' : 'required'; ?>>
                    </div>
                    <div class="col-md-6">
                        <label for="role_id" class="form-label">Vai trò</label>
                        <select class="form-select" id="role_id" name="role_id" required>
                            <option value="">Chọn vai trò</option>
                            <option value="1">Admin</option>
                            <option value="2">Boss</option>
                            <option value="3">Ban Điều Hành</option>
                            <option value="4">Huynh trưởng</option>
                            <option value="5">Thiếu Nhi</option>
                        </select>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-top d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary me-2">
                        <i class="fas fa-save me-1"></i> Lưu
                    </button>
                    <button type="button" class="btn btn-secondary" id="btn-cancel">
                        <i class="fas fa-times me-1"></i> Hủy
                    </button>
                </div>
            </form>
            <div id="form-message" class="mt-3"></div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const userId = document.getElementById('user_id')?.value;
    const userForm = document.getElementById('user-form');
    const formMessage = document.getElementById('form-message');
    const btnCancel = document.getElementById('btn-cancel');

    // Function to load user data into the form for editing
    function loadUserData(id) {
        formMessage.innerHTML = '<div class="alert alert-info d-flex align-items-center"><div class="spinner-border spinner-border-sm me-2" role="status"></div> Đang tải dữ liệu người dùng...</div>';
        
        fetch(`../../backend/api/users/GetUsers.php?id=${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.user) {
                    const user = data.user;
                    document.getElementById('full_name').value = user.full_name || '';
                    document.getElementById('username').value = user.username;
                    document.getElementById('email').value = user.email || '';
                    document.getElementById('role_id').value = user.role_id;
                    formMessage.innerHTML = ''; // Clear loading message on success
                } else {
                    formMessage.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i> Không tìm thấy người dùng.</div>`;
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
                formMessage.innerHTML = '<div class="alert alert-danger"><i class="fas fa-times-circle me-2"></i> Đã xảy ra lỗi khi tải dữ liệu.</div>';
            });
    }

    // If a user ID is present in the URL, load the user's data
    if (userId) {
        loadUserData(userId);
    }

    // Handle form submission via AJAX
    userForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(userForm);
        const action = formData.get('action');
        const endpoint = (action === 'update_user') ? 'UpdateUser.php' : 'CreateUser.php';

        // Hiển thị thông báo đang xử lý với spinner
        formMessage.innerHTML = '<div class="alert alert-info d-flex align-items-center"><div class="spinner-border spinner-border-sm me-2" role="status"></div> Đang xử lý...</div>';
        
        fetch(`../../backend/api/users/${endpoint}`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json();
            } else {
                // If it's not JSON, it's a server error or PHP warning.
                throw new Error('Server returned a non-JSON response. Check PHP error logs.');
            }
        })
        .then(data => {
            if (data.success) {
                // Hiển thị thông báo thành công
                formMessage.innerHTML = `<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i>${data.message}</div>`;
                
                if (action === 'create_user') {
                    // Xóa form sau khi tạo mới thành công
                    userForm.reset(); 
                    // Chuyển hướng về trang danh sách sau 2 giây
                    setTimeout(() => {
                        if (typeof loadContent !== 'undefined') {
                            loadContent('users');
                        }
                    }, 2000); 
                }
                // Nếu là cập nhật, thông báo sẽ hiển thị và form giữ nguyên
            } else {
                // Hiển thị thông báo thất bại
                formMessage.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            // Hiển thị thông báo lỗi chung
            formMessage.innerHTML = '<div class="alert alert-danger"><i class="fas fa-times-circle me-2"></i> Đã xảy ra lỗi. Vui lòng kiểm tra console hoặc thử lại sau.</div>';
        });
    });

    // Handle Cancel button click
    btnCancel.addEventListener('click', function() {
        if (typeof loadContent !== 'undefined') {
            loadContent('users'); // Load the user list page
        } else {
            console.warn('loadContent function is not defined. Cannot cancel.');
        }
    });
});

// Ensure loadContent from admin-common.js is available
if (typeof loadContent === 'undefined') {
    window.loadContent = function(contentId) {
        console.warn('loadContent function is not defined globally. Cannot load content:', contentId);
    };
}
</script>