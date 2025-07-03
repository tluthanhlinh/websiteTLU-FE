<?php
// This is a simple HTML/PHP file to be loaded dynamically by JavaScript.
// It does not need to be a full HTML document.
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0 text-muted">
            <i class="fas fa-user-friends me-2"></i> Quản lý Tài khoản
        </h4>
        <button class="btn btn-success" id="addUserBtn">
            <i class="fas fa-plus-circle me-2"></i> Thêm Tài khoản Mới
        </button>
    </div>

    <div class="row mb-4">
        <div class="col-md-6">
            <div class="input-group">
                <input type="text" class="form-control" id="searchInput" placeholder="Tìm kiếm theo tên, email...">
                <button class="btn btn-outline-secondary" type="button" id="searchBtn">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        </div>
        <div class="col-md-3">
            <select class="form-select" id="roleFilter">
                <option value="">Lọc theo vai trò</option>
                <option value="admin">Admin</option>
                <option value="huynhtruong">Huynh trưởng</option>
                <option value="doansinh">Đoàn sinh</option>
            </select>
        </div>
        <div class="col-md-3">
            <select class="form-select" id="statusFilter">
                <option value="">Lọc theo trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
            </select>
        </div>
    </div>

    <div class="card shadow-sm rounded-3 border-0">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover table-striped" id="userTable">
                    <thead class="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Tên đăng nhập</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="userTableBody">
                        <tr>
                            <td colspan="7" class="text-center">Đang tải dữ liệu...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <nav>
                <ul class="pagination justify-content-center" id="pagination">
                    </ul>
            </nav>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // 1. Khai báo các biến
    const userTableBody = document.getElementById('userTableBody');
    const addUserBtn = document.getElementById('addUserBtn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const pagination = document.getElementById('pagination');

    // URL của API backend để lấy danh sách người dùng
    // Đảm bảo URL này đúng với cấu trúc thư mục backend của bạn
    const API_BASE_URL = 'http://localhost:3000/backend/api/';
    const USERS_API_URL = API_BASE_URL + 'users/read.php';

    // 2. Hàm để tải danh sách người dùng từ API
    function fetchUsers(page = 1, searchTerm = '', role = '', status = '') {
        // Hiển thị thông báo đang tải
        userTableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border spinner-border-sm me-2" role="status"></div> Đang tải dữ liệu...</td></tr>';

        // Xây dựng URL với các tham số tìm kiếm và lọc
        const params = new URLSearchParams({
            page: page,
            search: searchTerm,
            role: role,
            status: status
        });
        const url = `${USERS_API_URL}?${params.toString()}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Xóa nội dung cũ
                userTableBody.innerHTML = '';
                
                if (data.users && data.users.length > 0) {
                    // Duyệt qua dữ liệu và thêm vào bảng
                    data.users.forEach(user => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-danger'}">
                                    ${user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                </span>
                            </td>
                            <td>${user.created_at}</td>
                            <td>
                                <button class="btn btn-sm btn-info edit-btn me-2" data-id="${user.id}">
                                    <i class="fas fa-edit"></i> Sửa
                                </button>
                                <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">
                                    <i class="fas fa-trash-alt"></i> Xóa
                                </button>
                            </td>
                        `;
                        userTableBody.appendChild(row);
                    });

                    // Gắn sự kiện cho các nút Sửa và Xóa
                    attachEventListeners();

                    // Cập nhật phân trang
                    updatePagination(data.total_pages, data.current_page);
                } else {
                    userTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Không tìm thấy tài khoản nào.</td></tr>';
                    pagination.innerHTML = ''; // Xóa phân trang nếu không có dữ liệu
                }
            })
            .catch(error => {
                console.error('Error fetching users:', error);
                userTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Không thể tải dữ liệu. Vui lòng kiểm tra kết nối API.</td></tr>';
                pagination.innerHTML = '';
            });
    }

    // 3. Hàm gắn sự kiện cho các nút Sửa và Xóa
    function attachEventListeners() {
        // Nút Sửa
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                // Gọi hàm loadContent từ file admin-common.js để tải form chỉnh sửa
                if (window.loadContent) {
                    window.loadContent('add-user', userId);
                }
            });
        });

        // Nút Xóa
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                if (confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
                    deleteUser(userId);
                }
            });
        });
    }

    // 4. Hàm xóa người dùng
    function deleteUser(userId) {
        fetch(API_BASE_URL + 'users/delete.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: userId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.message === 'User was deleted.') {
                alert('Xóa tài khoản thành công!');
                // Tải lại danh sách người dùng sau khi xóa
                fetchUsers();
            } else {
                alert('Lỗi: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Đã xảy ra lỗi khi xóa tài khoản. Vui lòng thử lại.');
        });
    }

    // 5. Hàm cập nhật phân trang
    function updatePagination(totalPages, currentPage) {
        pagination.innerHTML = ''; // Xóa phân trang cũ
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pagination.appendChild(li);
        }

        // Gắn sự kiện click cho các nút phân trang
        document.querySelectorAll('#pagination .page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = parseInt(this.getAttribute('data-page'));
                fetchUsers(page, searchInput.value, roleFilter.value, statusFilter.value);
            });
        });
    }

    // 6. Gắn sự kiện cho các bộ lọc và tìm kiếm
    searchBtn.addEventListener('click', () => fetchUsers(1, searchInput.value, roleFilter.value, statusFilter.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchUsers(1, searchInput.value, roleFilter.value, statusFilter.value);
        }
    });
    roleFilter.addEventListener('change', () => fetchUsers(1, searchInput.value, roleFilter.value, statusFilter.value));
    statusFilter.addEventListener('change', () => fetchUsers(1, searchInput.value, roleFilter.value, statusFilter.value));
    
    // 7. Gắn sự kiện cho nút "Thêm Tài khoản Mới"
    addUserBtn.addEventListener('click', function() {
        if (window.loadContent) {
            window.loadContent('add-user');
        }
    });

    // 8. Tải dữ liệu lần đầu khi trang được load
    fetchUsers();
});
</script>