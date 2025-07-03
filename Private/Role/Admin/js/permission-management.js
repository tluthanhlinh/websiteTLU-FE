// frontend/Private/Role/Admin/js/permission-management.js
// Lưu ý: Đã di chuyển file này từ Public sang Private/Role/Admin/js/ để phù hợp với cấu trúc của bạn
// và để giải quyết lỗi 404 trong console.

document.addEventListener('DOMContentLoaded', function() {
    console.log('permission-management.js đã được tải.');

    const permissionTableBody = document.getElementById('permissionTableBody');
    const permissionSearchInput = document.getElementById('permissionSearchInput');
    const permissionSearchButton = document.getElementById('permissionSearchButton');

    let availableRoles = []; // Sẽ lưu trữ các vai trò có sẵn từ API

    // Hàm lấy danh sách vai trò từ API (để populate dropdown)
    function fetchRoles() {
        // Đảm bảo đường dẫn chính xác. Nếu permission-management.js nằm trong
        // frontend/Private/Role/Admin/js/, thì đường dẫn đến API sẽ là:
        // /webxudoan_local_db/api/roles/GetRoles.php
        const rolesApiUrl = 'http://localhost/webxudoan_local_db/backend/api/roles/GetRoles.php';
        
        fetch(rolesApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response for roles was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                // Giả định API trả về { "records": [...] }
                if (data.records && data.records.length > 0) {
                    availableRoles = data.records;
                    fetchAccountsAndPermissions(); // Sau khi có roles, mới fetch accounts
                } else {
                    console.warn('Không có vai trò nào được tìm thấy.');
                    availableRoles = [];
                    fetchAccountsAndPermissions(); // Vẫn fetch accounts dù không có roles
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải danh sách vai trò:', error);
                alert('Không thể tải danh sách vai trò.');
                availableRoles = [];
                fetchAccountsAndPermissions();
            });
    }

    // Hàm để tạo các option cho select vai trò
    function createRoleOptions(selectedRoleId = null) {
        let optionsHtml = '<option value="">Chọn vai trò mới</option>';
        availableRoles.forEach(role => {
            const selected = (role.id == selectedRoleId) ? 'selected' : '';
            optionsHtml += `<option value="${role.id}" ${selected}>${role.name}</option>`;
        });
        return optionsHtml;
    }

    // Hàm lấy danh sách tài khoản và hiển thị trong bảng
    function fetchAccountsAndPermissions() {
        if (!permissionTableBody) {
             console.error("Element with ID 'permissionTableBody' not found.");
             return;
        }
        permissionTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>';
        
        // Đảm bảo đường dẫn chính xác
        const usersApiUrl = 'http://localhost/webxudoan_local_db/backend/api/users/GetUsers.php'; // Sử dụng GetUsers.php
        
        fetch(usersApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response for users was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                permissionTableBody.innerHTML = ''; // Xóa trạng thái tải
                // Giả định API trả về { "records": [...] }
                if (data.records && data.records.length > 0) {
                    data.records.forEach(account => {
                        // Tìm tên vai trò hiện tại
                        const currentRole = availableRoles.find(role => role.id == account.role_id);
                        const currentRoleName = currentRole ? currentRole.name : 'Không xác định';

                        const row = `
                            <tr>
                                <td>${account.id}</td>
                                <td>${account.username}</td>
                                <td>${account.email}</td>
                                <td>${currentRoleName}</td>
                                <td>
                                    <select class="form-select select-role" data-id="${account.id}">
                                        ${createRoleOptions(account.role_id)}
                                    </select>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-success save-permission-btn" data-id="${account.id}">
                                        <i class="fas fa-save"></i> Lưu
                                    </button>
                                </td>
                            </tr>
                        `;
                        permissionTableBody.insertAdjacentHTML('beforeend', row);
                    });
                    attachPermissionEventListeners(); // Gắn sự kiện sau khi render bảng
                } else {
                    permissionTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có tài khoản nào để phân quyền.</td></tr>';
                }
            })
            .catch(error => {
                console.error('Lỗi khi tải tài khoản để phân quyền:', error);
                permissionTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Lỗi: Không thể tải dữ liệu tài khoản.</td></tr>';
            });
    }

    // Hàm gắn sự kiện cho các nút "Lưu"
    function attachPermissionEventListeners() {
        document.querySelectorAll('.save-permission-btn').forEach(button => {
            button.addEventListener('click', function() {
                const userId = this.dataset.id;
                const newRoleId = document.querySelector(`.select-role[data-id="${userId}"]`).value;

                if (newRoleId === "" || newRoleId == 0) { // Đảm bảo đã chọn vai trò
                    alert("Vui lòng chọn một vai trò mới.");
                    return;
                }

                updateUserRole(userId, newRoleId);
            });
        });
    }

    // Hàm gửi yêu cầu cập nhật vai trò người dùng đến API
    function updateUserRole(userId, newRoleId) {
        const data = {
            id: userId,
            role_id: parseInt(newRoleId) // Đảm bảo role_id là số nguyên
        };

        // Đảm bảo đường dẫn chính xác
        const updateRoleApiUrl = 'http://localhost/webxudoan_local_db/backend/api/users/UpdateUserRole.php';
        
        fetch(updateRoleApiUrl, {
            method: 'PUT', // API UpdateUserRole.php của bạn là PUT
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // Xử lý lỗi HTTP. Có thể đọc thông báo lỗi từ body nếu API trả về
                return response.json().then(errorData => { throw new Error(errorData.message || 'Lỗi không xác định.'); });
            }
            return response.json();
        })
        .then(result => {
            // Kiểm tra message dựa trên phản hồi từ API PHP đã sửa đổi
            if (result.message === "Vai trò người dùng đã được cập nhật.") { 
                alert('Cập nhật vai trò thành công!');
                fetchAccountsAndPermissions(); // Tải lại bảng sau khi cập nhật
            } else {
                alert('Lỗi khi cập nhật vai trò: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Lỗi API cập nhật vai trò:', error);
            alert('Có lỗi xảy ra khi cập nhật vai trò: ' + error.message);
        });
    }

    // Xử lý tìm kiếm (tùy chọn) - Sẽ cần API hỗ trợ tham số tìm kiếm
    if (permissionSearchButton) {
        permissionSearchButton.addEventListener('click', function() {
            const searchTerm = permissionSearchInput.value.toLowerCase();
            alert('Chức năng tìm kiếm đang được phát triển. Dữ liệu sẽ được lọc khi API backend hỗ trợ tìm kiếm.');
            // Để triển khai, bạn sẽ cần:
            // 1. Cập nhật fetchAccountsAndPermissions để nhận searchTerm
            // 2. Cập nhật GetUsers.php để lọc dữ liệu dựa trên searchTerm
        });
    }

    // Khởi tạo: Lấy danh sách vai trò và sau đó tài khoản khi trang được tải
    fetchRoles();
});