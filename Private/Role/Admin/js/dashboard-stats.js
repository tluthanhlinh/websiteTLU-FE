// frontend/Private/Role/Admin/js/dashboard-stats.js

async function fetchDashboardStats() {
    // SỬA ĐƯỜNG DẪN NÀY ĐỂ TRỎ ĐẾN API THỰC TẾ CỦA BẠN
    // Đảm bảo 'webxudoan_local_db' là tên thư mục gốc của dự án bạn trong htdocs/www
    const apiUrl = 'http://localhost/webxudoan_local_db/backend/api/dashboard/GetDashboardStats.php'; 

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Ném lỗi với status để biết rõ hơn
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`); 
        }
        const data = await response.json();
        
        // Cập nhật DOM với dữ liệu lấy được
        // Thêm kiểm tra null trước khi cập nhật textContent để tránh lỗi
        const totalUsersEl = document.getElementById('totalUsers');
        if (totalUsersEl) totalUsersEl.textContent = data.total_users || 0;

        const totalActivitiesEl = document.getElementById('totalActivities');
        if (totalActivitiesEl) totalActivitiesEl.textContent = data.total_activities || 0;

        const totalPostsEl = document.getElementById('totalPosts');
        if (totalPostsEl) totalPostsEl.textContent = data.total_posts || 0;

        const totalAdminsEl = document.getElementById('totalAdmins');
        if (totalAdminsEl) totalAdminsEl.textContent = data.total_admins || 0;

        const totalBossesEl = document.getElementById('totalBosses');
        if (totalBossesEl) totalBossesEl.textContent = data.total_bosses || 0;

        const upcomingActivitiesEl = document.getElementById('upcomingActivities');
        if (upcomingActivitiesEl) upcomingActivitiesEl.textContent = data.upcoming_activities || 0; 

        console.log("Dashboard stats fetched and updated successfully.", data);

    } catch (error) {
        console.error('Lỗi khi fetch dashboard stats:', error);
        // Hiển thị lỗi ra UI nếu các phần tử tồn tại
        const elementsToUpdate = ['totalUsers', 'totalActivities', 'totalPosts', 'totalAdmins', 'totalBosses', 'upcomingActivities'];
        elementsToUpdate.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'Lỗi API.';
        });
    }
}

// Gọi hàm khi DOM đã tải xong
// Hàm này sẽ được gọi bởi admin-common.js khi contentId là 'dashboard'
// Nhưng cũng có thể gọi trực tiếp nếu dashboard_admin.html là trang đầu tiên tải
// document.addEventListener('DOMContentLoaded', fetchDashboardStats);