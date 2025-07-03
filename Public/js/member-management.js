// frontend/Public/js/member-management.js

document.addEventListener('DOMContentLoaded', function() {
    console.log('member-management.js đã được tải và chạy.');

    const usersTableBody = document.getElementById('usersTableBody');
    const openAddUserModalBtn = document.getElementById('openAddUserModalBtn');
    const addUserModalElement = document.getElementById('addUserModal');
    const addUserModal = new bootstrap.Modal(addUserModalElement); // Khởi tạo đối tượng Bootstrap Modal
    const addUserForm = document.getElementById('addUserForm');

    const editUserModalElement = document.getElementById('editUserModal');
    const editUserModal = new bootstrap.Modal(editUserModalElement);
    const editUserForm = document.getElementById('editUserForm');
    const editUserIdInput = document.getElementById('editUserId');

    const deleteUserModalElement = document.getElementById('deleteUserModal');
    const deleteUserModal = new bootstrap.Modal(deleteUserModalElement);
    const confirmDeleteUserBtn = document.getElementById('confirmDeleteUserBtn');
    const deleteUserIdInput = document.getElementById('deleteUserId');

    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');

    // Hàm lấy danh sách người dùng từ API
    function fetchUsers() {
        usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Đang tải dữ liệu...</td></tr>';
        fetch('../../api/users/GetUsers.php') // Điều chỉnh đường dẫn API của bạn
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                usersTableBody.innerHTML = ''; // Xóa thông báo "Đang tải"
                if (data.data && data.data.length > 0) {
                    data.data.forEach(user => {
                        const row = `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.username}</td>
                                <td>${user.email}</td>
                                <td>${user.full_name}</td>
                                <td>${user.role_name ? user.role_name : 'N/A'}</td> <td>${user.status === 'active' ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-danger">Inactive</span>'}</td>
                                <td>${user.created_at}</td>
                                <td>
                                    <button class="btn btn-sm btn-info edit-btn" data-id="${user.id}"
                                        data-username="${user.username}"
                                        data-email="${user.email}"
                                        data-full_name="${user.full_name}"
                                        data-role_id="${user.role_id}"
                                        data-status="${user.status}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-btn" data-id="${user.id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        usersTableBody.innerHTML += row;
                    });
                    attachEventListenersToButtons(); // Gắn lại sự kiện sau khi render
                } else {
                    usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có tài khoản nào.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải người dùng:', error);
                usersTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Lỗi: Không thể tải dữ liệu người dùng. Vui lòng kiểm tra console.</td></tr>';
            });
    }

    // Hàm gắn sự kiện cho các nút Edit/Delete
    function attachEventListenersToButtons() {
        // Nút Edit
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                const username = this.dataset.username;
                const email = this.dataset.email;
                const fullName = this.dataset.full_name;
                const roleId = this.dataset.role_id;
                const status = this.dataset.status;

                editUserIdInput.value = id;
                document.getElementById('editUsername').value = username;
                document.getElementById('editEmail').value = email;
                document.getElementById('editFullName').value = fullName;
                document.getElementById('editRole').value = roleId; // Gán giá trị role_id
                document.getElementById('editStatus').value = status;

                editUserModal.show();
            });
        });

        // Nút Delete
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = this.dataset.id;
                deleteUserIdInput.value = id;
                deleteUserModal.show();
            });
        });
    }

    // --- Xử lý sự kiện cho Modal "Thêm Tài khoản Mới" ---
    // Đây là phần quan trọng để nút "Thêm Tài khoản Mới" hoạt động
    if (openAddUserModalBtn) {
        openAddUserModalBtn.addEventListener('click', function() {
            // Có thể reset form tại đây trước khi mở
            addUserForm.reset();
            addUserModal.show(); // Hiển thị modal nhập thông tin
        });
    }

    if (addUserForm) {
        addUserForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Ngăn chặn form submit mặc định

            const username = document.getElementById('newUsername').value;
            const email = document.getElementById('newEmail').value;
            const fullName = document.getElementById('newFullName').value;
            const password = document.getElementById('newPassword').value;
            const role_id = document.getElementById('newRole').value;
            const status = document.getElementById('newStatus').value;

            const data = {
                username: username,
                email: email,
                full_name: fullName,
                password: password, // Mật khẩu sẽ được hash ở backend
                role_id: role_id,
                status: status
            };

            fetch('../../api/users/CreateUser.php', { // Điều chỉnh đường dẫn API của bạn
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.message === "User created successfully.") { // Kiểm tra đúng tin nhắn từ API
                    alert('Thêm tài khoản thành công!');
                    addUserModal.hide(); // Ẩn modal
                    fetchUsers(); // Tải lại danh sách người dùng
                } else {
                    alert('Lỗi: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Lỗi khi thêm tài khoản:', error);
                alert('Có lỗi xảy ra khi thêm tài khoản.');
            });
        });
    }

    // --- Xử lý sự kiện cho Modal "Chỉnh sửa Tài khoản" (Edit) ---
    if (editUserForm) {
        editUserForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const id = editUserIdInput.value;
            const username = document.getElementById('editUsername').value;
            const email = document.getElementById('editEmail').value;
            const fullName = document.getElementById('editFullName').value;
            const role_id = document.getElementById('editRole').value;
            const status = document.getElementById('editStatus').value;

            const data = {
                id: id,
                username: username,
                email: email,
                full_name: fullName,
                role_id: role_id,
                status: status
            };

            fetch('../../api/users/UpdateUser.php', { // Điều chỉnh đường dẫn API của bạn
                method: 'PUT', // Hoặc POST, tùy thuộc vào API của bạn
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(result => {
                if (result.message === "User updated successfully.") { // Kiểm tra đúng tin nhắn từ API
                    alert('Cập nhật tài khoản thành công!');
                    editUserModal.hide();
                    fetchUsers();
                } else {
                    alert('Lỗi: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Lỗi khi cập nhật tài khoản:', error);
                alert('Có lỗi xảy ra khi cập nhật tài khoản.');
            });
        });
    }

    // --- Xử lý sự kiện cho Modal "Xóa Tài khoản" (Delete) ---
    if (confirmDeleteUserBtn) {
        confirmDeleteUserBtn.addEventListener('click', function() {
            const id = deleteUserIdInput.value;

            fetch('../../api/users/DeleteUser.php', { // Điều chỉnh đường dẫn API của bạn
                method: 'DELETE', // Hoặc POST, tùy thuộc vào API của bạn
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id })
            })
            .then(response => response.json())
            .then(result => {
                if (result.message === "User deleted successfully.") { // Kiểm tra đúng tin nhắn từ API
                    alert('Xóa tài khoản thành công!');
                    deleteUserModal.hide();
                    fetchUsers();
                } else {
                    alert('Lỗi: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Lỗi khi xóa tài khoản:', error);
                alert('Có lỗi xảy ra khi xóa tài khoản.');
            });
        });
    }

    // --- Xử lý tìm kiếm và lọc ---
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            // Implement search logic here
            // You might need to modify your GetUsers.php to accept search/filter parameters
            console.log('Tìm kiếm clicked:', searchInput.value);
            // fetchUsers(); // Call fetchUsers again with search parameters
        });
    }

    if (roleFilter) {
        // Tải các tùy chọn vai trò nếu bạn có API cho vai trò
        // fetch('../../api/roles/GetRoles.php').then(...).then(roles => { populate select options})
        roleFilter.addEventListener('change', function() {
            console.log('Lọc vai trò:', this.value);
            // fetchUsers(); // Call fetchUsers again with role filter
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            console.log('Lọc trạng thái:', this.value);
            // fetchUsers(); // Call fetchUsers again with status filter
        });
    }

    // Khởi tạo: Lấy dữ liệu người dùng khi trang quản lý thành viên được tải
    fetchUsers();
});