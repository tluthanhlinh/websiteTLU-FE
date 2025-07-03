// frontend/Private/Role/Admin/js/manage-users.js

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();

    // Event listener cho nút "Thêm Tài khoản Mới" hoặc form thêm mới
    // (Bạn cần có modal hoặc form HTML tương ứng)
    const addNewAccountBtn = document.getElementById('addNewAccountBtn'); // ID của nút "Thêm Tài khoản Mới"
    if (addNewAccountBtn) {
        addNewAccountBtn.addEventListener('click', function() {
            // Hiển thị modal/form thêm tài khoản
            console.log("Mở form thêm tài khoản mới");
            // Gọi hàm mở modal/form của bạn
            openCreateUserModal(); // Giả định bạn có hàm này
        });
    }

    // Event listener cho nút tìm kiếm hoặc sự kiện input thay đổi
    const searchInput = document.getElementById('searchInput'); // ID của input tìm kiếm
    const roleFilter = document.getElementById('roleFilter'); // ID của select lọc vai trò
    const statusFilter = document.getElementById('statusFilter'); // ID của select lọc trạng thái
    const searchBtn = document.getElementById('searchBtn'); // ID của nút tìm kiếm (nếu có)

    if (searchBtn) {
        searchBtn.addEventListener('click', loadUsers); // Tải lại người dùng khi nhấn tìm kiếm
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadUsers, 500)); // Debounce để tránh gọi API quá nhiều
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', loadUsers);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', loadUsers);
    }

    // Hàm debounce để giới hạn tần suất gọi hàm (ví dụ: khi gõ tìm kiếm)
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
});

// Hàm để tải danh sách người dùng từ API
function loadUsers() {
    const tableBody = document.getElementById('userTableBody'); // ID của tbody trong bảng
    if (!tableBody) {
        console.error("Element with ID 'userTableBody' not found.");
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>'; // Hiển thị trạng thái tải

    const searchQuery = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    const selectedRole = document.getElementById('roleFilter') ? document.getElementById('roleFilter').value : '';
    const selectedStatus = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';

    // Xây dựng URL API với các tham số tìm kiếm và lọc (nếu có)
    // Hiện tại GetUsers.php không xử lý tham số, nhưng chúng ta chuẩn bị sẵn cho tương lai
    let apiUrl = 'http://localhost/webxudoan_local_db/backend/api/users/GetUsers.php'; // Điều chỉnh đường dẫn API của bạn
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedRole && selectedRole !== 'all') params.append('role_id', selectedRole);
    if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);

    if (params.toString()) {
        // apiUrl += '?' + params.toString(); // Bỏ comment nếu GetUsers.php hỗ trợ tìm kiếm/lọc
    }

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                // Kiểm tra nếu phản hồi không thành công (ví dụ: 404, 500)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            tableBody.innerHTML = ''; // Xóa thông báo "Đang tải dữ liệu..."

            if (data.message) { // Nếu API trả về message (ví dụ: Không tìm thấy người dùng)
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center">${data.message}</td></tr>`;
            } else if (data.records && data.records.length > 0) {
                data.records.forEach(user => {
                    const row = `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.full_name}</td>
                            <td>${user.role_name}</td>
                            <td>${user.status === 'active' ? 'Hoạt động' : (user.status === 'inactive' ? 'Không hoạt động' : 'Đình chỉ')}</td>
                            <td>${new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                            <td>
                                <button class="btn btn-sm btn-info edit-user-btn" data-id="${user.id}">Sửa</button>
                                <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user.id}">Xóa</button>
                            </td>
                        </tr>
                    `;
                    tableBody.insertAdjacentHTML('beforeend', row);
                });

                // Gán sự kiện cho các nút Sửa/Xóa sau khi đã render
                attachUserActionListeners();

            } else {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu người dùng.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Lỗi khi tải người dùng:', error);
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Có lỗi xảy ra khi tải dữ liệu. (${error.message})</td></tr>`;
        });
}

// Hàm để gán sự kiện cho nút Sửa/Xóa (cần được gọi lại sau mỗi lần tải dữ liệu)
function attachUserActionListeners() {
    document.querySelectorAll('.edit-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.dataset.id;
            console.log('Sửa người dùng:', userId);
            // TODO: Mở modal chỉnh sửa và tải dữ liệu người dùng cụ thể
            // Ví dụ: openEditUserModal(userId);
        });
    });

    document.querySelectorAll('.delete-user-btn').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.dataset.id;
            if (confirm(`Bạn có chắc chắn muốn xóa người dùng ID: ${userId} không?`)) {
                deleteUser(userId);
            }
        });
    });
}

// Hàm gửi request xóa người dùng
function deleteUser(userId) {
    fetch('http://localhost/webxudoan_local_db/backend/api/users/DeleteUser.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message); // Hiển thị thông báo từ API
            loadUsers(); // Tải lại danh sách sau khi xóa
        } else {
            alert('Xóa người dùng thất bại.');
        }
    })
    .catch(error => {
        console.error('Lỗi khi xóa người dùng:', error);
        alert('Có lỗi xảy ra khi xóa người dùng.');
    });
}


// TODO: Viết hàm openCreateUserModal() và openEditUserModal(userId)
// Các hàm này sẽ hiển thị modal/form và có logic gửi POST/PUT request đến CreateUser.php và UpdateUser.php
// Đảm bảo trong modal/form có đủ các input cho username, full_name, email, password, role_id, status.
// Khi submit form, bạn sẽ lấy dữ liệu từ các input và gửi lên API.