// admin-common.js

document.addEventListener('DOMContentLoaded', function() {
    // Selectors dựa trên HTML bạn cung cấp
    const allContentLinks = document.querySelectorAll('[data-content]');
    const dynamicContentContainer = document.getElementById('dynamic-content'); // Container để tải nội dung HTML động
    const dashboardContent = document.getElementById('dashboard-content'); // Phần nội dung mặc định của dashboard (nếu có)
    const sidebarLinks = document.querySelectorAll('#sidebar-wrapper .list-group-item');
    const navbarTextSpan = document.querySelector('.navbar-text span'); // Chọn thẻ span bên trong .navbar-text

    // Kiểm tra và xử lý nếu dynamicContentContainer không tồn tại
    if (!dynamicContentContainer) {
        console.error("Lỗi: Element với ID 'dynamic-content' không được tìm thấy. Nội dung động sẽ không tải.");
        // Có thể hiển thị một thông báo lỗi trên UI hoặc dừng script
        return; 
    }

    // Toggle sidebar functionality
    const sidebarToggle = document.getElementById('sidebarToggle'); // ID từ HTML của bạn
    const wrapper = document.getElementById('wrapper');
    if (sidebarToggle && wrapper) {
        sidebarToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Function to update the title in the navbar (đặt lên trên để có thể gọi)
    function updateNavbarText(text) {
        if (navbarTextSpan) {
            const userInfo = JSON.parse(localStorage.getItem('user_info')) || JSON.parse(sessionStorage.getItem('user_info'));
            let userName = 'Khách';
            if (userInfo && userInfo.full_name) {
                userName = userInfo.full_name;
            } else if (userInfo && userInfo.username) {
                userName = userInfo.username;
            }
            navbarTextSpan.innerHTML = `👋 Xin chào ${userName}, <span class="fw-bold">${text}</span>`;
        }
    }

    // --- Core function to load content dynamically ---
    window.loadContent = async function(contentId) { // Đặt hàm này vào window để có thể gọi từ global scope
        let url = '';
        let pageTitle = '';

        // Ẩn tất cả các khu vực nội dung chính trước khi tải nội dung mới
        if (dashboardContent) {
            dashboardContent.style.display = 'none';
        }
        dynamicContentContainer.style.display = 'none';
        dynamicContentContainer.innerHTML = ''; // Xóa nội dung cũ

        // Xóa tất cả các script JS đã được tải động trước đó
        document.querySelectorAll('script[data-dynamic-script]').forEach(script => script.remove());

        // Cập nhật lớp 'active' cho liên kết sidebar
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
        });
        const currentLink = document.querySelector(`[data-content="${contentId}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }

        // Kiểm tra nội dung cần tải và xác định URL
        switch (contentId) {
            case 'dashboard':
                if (dashboardContent) {
                    dashboardContent.style.display = 'block'; // Hiện lại dashboard content
                }
                pageTitle = 'Trang chủ';
                updateNavbarText(pageTitle);
                // Gọi lại fetchDashboardStats khi quay lại dashboard
                if (typeof fetchDashboardStats === 'function') {
                    fetchDashboardStats();
                } else {
                    console.warn("Chức năng fetchDashboardStats không được tìm thấy. Thống kê dashboard có thể không cập nhật.");
                }
                return; // Không cần fetch HTML nếu là dashboard mặc định
            case 'users':
            case 'add-user': // Giả sử 'add-user' cũng tải 'manage-users.html'
                url = 'manage-users.html'; 
                pageTitle = 'Quản lý Tài khoản';
                break;
            case 'permissions':
                url = 'manage-permissions.html'; 
                pageTitle = 'Phân quyền, chức năng';
                break;
            case 'huynhtruong': 
                url = 'manage-huynhtruong.html'; 
                pageTitle = 'Quản lý Huynh trưởng';
                break;
            case 'activities':
                url = 'manage-activities.html';
                pageTitle = 'Quản lý Hoạt động / Sự kiện';
                break;
            case 'posts':
            case 'add-post':
                url = 'manage-posts.html';
                pageTitle = 'Quản lý Tin tức / Thông báo';
                break;
            case 'settings':
                url = 'system-settings.html';
                pageTitle = 'Cấu hình Hệ thống';
                break;
            case 'logout':
                fetch('http://localhost/webxudoan_local_db/backend/api/users/Logout.php', { // Đảm bảo đường dẫn API Logout đúng
                    method: 'POST'
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                    localStorage.removeItem('user_info');
                    sessionStorage.removeItem('user_info');
                    alert('Bạn đã đăng xuất.');
                    window.location.href = '/webxudoan_local_db/frontend/Public/login.html';
                })
                .catch(error => {
                    console.error('Lỗi khi đăng xuất:', error);
                    alert('Có lỗi xảy ra khi đăng xuất.');
                    window.location.href = '/webxudoan_local_db/frontend/Public/login.html';
                });
                return; 
            default:
                console.warn(`ID nội dung '${contentId}' không được nhận dạng. Đang tải dashboard.`);
                loadContent('dashboard'); 
                return;
        }

        // Nếu có URL, tiến hành fetch nội dung HTML
        if (url) {
            try {
                // Fetch HTML: Đường dẫn tương đối `url` (ví dụ: 'manage-users.html')
                // được giải quyết dựa trên URL của `dashboard_admin.html`.
                // Điều này có nghĩa là các file HTML con phải nằm cùng cấp với `dashboard_admin.html`.
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Không thể tải nội dung HTML: ${response.statusText} (HTTP ${response.status})`);
                }
                const html = await response.text();

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Lấy nội dung từ thẻ <body> của HTML được tải
                const newContentHtml = doc.body.innerHTML; 
                // Lấy tất cả các thẻ <script> từ nội dung được tải
                const scriptsToExecute = doc.querySelectorAll('script'); 

                dynamicContentContainer.innerHTML = newContentHtml;
                dynamicContentContainer.style.display = 'block'; // Hiển thị container sau khi tải nội dung

                // Thực thi các script trong nội dung được tải
                scriptsToExecute.forEach(oldScript => {
                    const newScript = document.createElement('script');

                    // Sao chép thuộc tính từ script cũ (ví dụ: src, type, async, defer)
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });

                    // XỬ LÝ ĐƯỜNG DẪN SRC CỦA SCRIPT
                    if (oldScript.src) {
                        // Lấy tên file của script (ví dụ: "manage-users.js")
                        const scriptFileName = oldScript.src.substring(oldScript.src.lastIndexOf('/') + 1);
                        
                        // Xây dựng đường dẫn mới, giả định script nằm trong thư mục 'js'
                        // so với vị trí của 'dashboard_admin.html'.
                        // Tức là: http://localhost:3000/frontend/Private/Role/Admin/js/
                        newScript.src = `./js/${scriptFileName}`; // SỬA ĐÂY
                        console.log(`Đang tải script động: ${newScript.src}`);
                    }
                    
                    if (oldScript.textContent) {
                        newScript.textContent = oldScript.textContent;
                    }
                    newScript.setAttribute('data-dynamic-script', 'true'); // Đánh dấu script được tải động
                    document.body.appendChild(newScript); // Thêm vào body để đảm bảo thực thi
                });

                updateNavbarText(pageTitle);
                console.log(`Nội dung '${contentId}' đã tải thành công từ ${url}.`);

                // Logic mở modal nếu là 'add-user'
                if (contentId === 'add-user') {
                    // Cần một khoảng thời gian ngắn để DOM được render hoàn chỉnh
                    setTimeout(() => {
                        // Đảm bảo hàm openCreateUserModal đã được tải và có sẵn từ manage-users.js
                        if (typeof openCreateUserModal === 'function') {
                            openCreateUserModal();
                            console.log('Hàm openCreateUserModal đã được gọi.');
                        } else {
                            console.warn('Không tìm thấy hàm openCreateUserModal sau khi tải nội dung. Đang thử nhấp nút.');
                            const openModalBtn = document.getElementById('addAccountBtn'); // ID nút trong manage-users.html
                            if (openModalBtn) {
                                openModalBtn.click();
                                console.log('Đã nhấp addAccountBtn để mở modal.');
                            } else {
                                console.error('Không tìm thấy nút addAccountBtn, không thể mở modal cho add-user.');
                            }
                        }
                    }, 100); // Đợi 100ms để DOM ổn định
                }

            } catch (error) {
                console.error('Lỗi khi tải nội dung:', error);
                dynamicContentContainer.innerHTML = `<div class="alert alert-danger mt-4 p-4">Không thể tải nội dung này: ${error.message}</div>`;
                dynamicContentContainer.style.display = 'block';
            }
        }
    };

    // --- Event listener for all links and buttons with `data-content` ---
    allContentLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const contentId = this.dataset.content;
            loadContent(contentId);
        });
    });

    // --- Initial content load on page load ---
    loadContent('dashboard'); // Tải mặc định Dashboard

    // Đảm bảo liên kết sidebar 'dashboard' được active ban đầu
    const initialActiveLink = document.querySelector('#sidebar-wrapper [data-content="dashboard"]');
    if (initialActiveLink) {
        initialActiveLink.classList.add('active');
    }
});