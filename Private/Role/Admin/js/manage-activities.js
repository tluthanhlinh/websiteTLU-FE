// frontend/Private/Role/Admin/js/manage-activities.js

// Đảm bảo API_BASE_URL được định nghĩa trong admin-common.js và đã được load trước manage-activities.js
// const API_BASE_URL = 'http://localhost/webxudoan_local_db/backend/api/'; // Định nghĩa trong admin-common.js

document.addEventListener('DOMContentLoaded', function() {
    const activitiesTableBody = document.getElementById('activitiesTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const statusFilter = document.getElementById('statusFilter');
    const noActivitiesFound = document.getElementById('noActivitiesFound');

    const activityModal = new bootstrap.Modal(document.getElementById('activityModal'));
    const activityModalLabel = document.getElementById('activityModalLabel');
    const activityForm = document.getElementById('activityForm');
    const activityIdInput = document.getElementById('activityId');
    const activityTitleInput = document.getElementById('activityTitle');
    const activityDescriptionInput = document.getElementById('activityDescription');
    const activityStartDateInput = document.getElementById('activityStartDate');
    const activityEndDateInput = document.getElementById('activityEndDate');
    const activityLocationInput = document.getElementById('activityLocation');
    const activityImageUrlInput = document.getElementById('activityImageUrl');
    const activityStatusInput = document.getElementById('activityStatus');
    const saveActivityButton = document.getElementById('saveActivityButton');

    const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    let activityToDeleteId = null;

    // Hàm tải danh sách hoạt động
    async function fetchActivities(searchTerm = '', status = '') {
        activitiesTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Đang tải dữ liệu...</td></tr>';
        noActivitiesFound.classList.add('d-none'); // Ẩn thông báo không tìm thấy

        let url = `${API_BASE_URL}activities/GetActivities.php`;
        const params = new URLSearchParams();
        if (searchTerm) {
            params.append('search', searchTerm);
        }
        if (status) {
            params.append('status', status);
        }
        if (params.toString()) {
            url += '?' + params.toString();
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                if (response.status === 404) {
                    activitiesTableBody.innerHTML = ''; // Xóa thông báo đang tải
                    noActivitiesFound.classList.remove('d-none'); // Hiển thị thông báo không tìm thấy
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayActivities(data.records);
        } catch (error) {
            console.error('Lỗi khi tải danh sách hoạt động:', error);
            activitiesTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Không thể tải dữ liệu hoạt động. Vui lòng thử lại sau.</td></tr>';
        }
    }

    // Hàm hiển thị hoạt động lên bảng
    function displayActivities(activities) {
        activitiesTableBody.innerHTML = '';
        if (activities && activities.length > 0) {
            noActivitiesFound.classList.add('d-none');
            activities.forEach(activity => {
                const row = `
                    <tr>
                        <td>${activity.activity_id}</td>
                        <td>${activity.title}</td>
                        <td>${activity.description.substring(0, 50)}...</td>
                        <td>${new Date(activity.start_date).toLocaleString()}</td>
                        <td>${new Date(activity.end_date).toLocaleString()}</td>
                        <td>${activity.location}</td>
                        <td>${activity.status}</td>
                        <td>${activity.created_by_username || 'N/A'}</td>
                        <td>${new Date(activity.created_at).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-sm btn-info edit-activity-btn" data-id="${activity.activity_id}"><i class="fas fa-edit"></i> Sửa</button>
                            <button class="btn btn-sm btn-danger delete-activity-btn" data-id="${activity.activity_id}"><i class="fas fa-trash-alt"></i> Xóa</button>
                        </td>
                    </tr>
                `;
                activitiesTableBody.innerHTML += row;
            });
        } else {
            noActivitiesFound.classList.remove('d-none');
        }
    }

    // Xử lý submit form thêm/sửa hoạt động
    activityForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const activityId = activityIdInput.value;
        const method = activityId ? 'PUT' : 'POST';
        const url = activityId ? `${API_BASE_URL}activities/UpdateActivity.php` : `${API_BASE_URL}activities/CreateActivity.php`;

        const activityData = {
            title: activityTitleInput.value,
            description: activityDescriptionInput.value,
            start_date: activityStartDateInput.value,
            end_date: activityEndDateInput.value,
            location: activityLocationInput.value,
            image_url: activityImageUrlInput.value || null,
            status: activityStatusInput.value,
            // created_by: Lấy từ session/local storage của người dùng đã đăng nhập nếu có auth
            // category_id: Lấy từ select box nếu có
        };

        if (activityId) {
            activityData.activity_id = activityId;
        }
        // Giả sử có created_by từ admin-common.js hoặc session
        // activityData.created_by = currentLoggedInUserId; 

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer ' + userToken // Nếu có token xác thực
                },
                body: JSON.stringify(activityData)
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                activityModal.hide();
                fetchActivities(searchInput.value, statusFilter.value); // Tải lại danh sách
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể lưu hoạt động.'));
            }
        } catch (error) {
            console.error('Lỗi khi lưu hoạt động:', error);
            alert('Đã xảy ra lỗi mạng hoặc lỗi không xác định.');
        }
    });

    // Xử lý nút "Thêm Hoạt động Mới"
    document.querySelector('[data-bs-target="#addActivityModal"]').addEventListener('click', function() {
        activityModalLabel.textContent = 'Thêm Hoạt động Mới';
        activityForm.reset();
        activityIdInput.value = ''; // Xóa ID để biết là thêm mới
        // Thiết lập giá trị mặc định nếu cần
        activityStatusInput.value = 'upcoming';
        const now = new Date();
        const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, -8);
        activityStartDateInput.value = localDateTime;
        activityEndDateInput.value = localDateTime; // Hoặc một thời điểm sau đó
    });


    // Xử lý nút "Sửa"
    activitiesTableBody.addEventListener('click', async function(event) {
        if (event.target.classList.contains('edit-activity-btn')) {
            const id = event.target.dataset.id;
            try {
                const response = await fetch(`${API_BASE_URL}activities/GetActivityById.php?id=${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const activity = await response.json();

                activityModalLabel.textContent = 'Sửa Hoạt động';
                activityIdInput.value = activity.activity_id;
                activityTitleInput.value = activity.title;
                activityDescriptionInput.value = activity.description;
                // Định dạng lại datetime-local
                activityStartDateInput.value = activity.start_date ? activity.start_date.substring(0, 16) : '';
                activityEndDateInput.value = activity.end_date ? activity.end_date.substring(0, 16) : '';
                activityLocationInput.value = activity.location;
                activityImageUrlInput.value = activity.image_url;
                activityStatusInput.value = activity.status;

                activityModal.show();
            } catch (error) {
                console.error('Lỗi khi tải thông tin hoạt động để sửa:', error);
                alert('Không thể tải thông tin hoạt động này.');
            }
        }
    });

    // Xử lý nút "Xóa"
    activitiesTableBody.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-activity-btn')) {
            activityToDeleteId = event.target.dataset.id;
            deleteConfirmModal.show();
        }
    });

    confirmDeleteButton.addEventListener('click', async function() {
        if (activityToDeleteId) {
            try {
                const response = await fetch(`${API_BASE_URL}activities/DeleteActivity.php`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': 'Bearer ' + userToken
                    },
                    body: JSON.stringify({ activity_id: activityToDeleteId })
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    deleteConfirmModal.hide();
                    fetchActivities(searchInput.value, statusFilter.value); // Tải lại danh sách
                } else {
                    alert('Lỗi: ' + (result.message || 'Không thể xóa hoạt động.'));
                }
            } catch (error) {
                console.error('Lỗi khi xóa hoạt động:', error);
                alert('Đã xảy ra lỗi mạng hoặc lỗi không xác định.');
            } finally {
                activityToDeleteId = null;
            }
        }
    });

    // Xử lý tìm kiếm và lọc
    searchButton.addEventListener('click', () => fetchActivities(searchInput.value, statusFilter.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchActivities(searchInput.value, statusFilter.value);
        }
    });
    statusFilter.addEventListener('change', () => fetchActivities(searchInput.value, statusFilter.value));

    // Tải hoạt động khi trang được load lần đầu
    fetchActivities();
});