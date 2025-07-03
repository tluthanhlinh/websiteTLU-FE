// frontend/public/js/posts-loader.js - Gói gọn trong hàm để common.js gọi

// Hàm chung để hiển thị lỗi
function showPageErrorMessage(message, errorMessageDivId = 'errorMessage', postsContainerId = 'postsContainer', infoMessageDivId = 'infoMessage') {
    const errorMessageDiv = document.getElementById(errorMessageDivId);
    const postsContainer = document.getElementById(postsContainerId);
    const infoMessageDiv = document.getElementById(infoMessageDivId);

    if (errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }
    if (postsContainer) {
        postsContainer.innerHTML = ''; // Xóa bài viết cũ
    }
    if (infoMessageDiv) infoMessageDiv.style.display = 'none';
}

// Hàm chung để hiển thị thông tin (ví dụ: không có bài viết)
function showPageInfoMessage(message, infoMessageDivId = 'infoMessage', postsContainerId = 'postsContainer', errorMessageDivId = 'errorMessage') {
    const infoMessageDiv = document.getElementById(infoMessageDivId);
    const postsContainer = document.getElementById(postsContainerId);
    const errorMessageDiv = document.getElementById(errorMessageDivId);

    if (infoMessageDiv) {
        infoMessageDiv.textContent = message;
        infoMessageDiv.style.display = 'block';
    }
    if (postsContainer) {
        postsContainer.innerHTML = ''; // Xóa bài viết cũ
    }
    if (errorMessageDiv) errorMessageDiv.style.display = 'none';
}

// Hàm chung để hiển thị bài viết
function displayPosts(posts, postsContainerId = 'postsContainer', errorMessageDivId = 'errorMessage', infoMessageDivId = 'infoMessage') {
    const postsContainer = document.getElementById(postsContainerId);
    const errorMessageDiv = document.getElementById(errorMessageDivId);
    const infoMessageDiv = document.getElementById(infoMessageDivId);

    if (errorMessageDiv) errorMessageDiv.style.display = 'none';
    if (infoMessageDiv) infoMessageDiv.style.display = 'none';

    if (!postsContainer) {
        console.error(`Không tìm thấy #${postsContainerId} để hiển thị bài viết.`);
        return;
    }

    postsContainer.innerHTML = ''; // Xóa bài viết cũ

    if (posts.length === 0) {
        showPageInfoMessage('Không tìm thấy bài viết nào.', infoMessageDivId, postsContainerId, errorMessageDivId);
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'article-item'; // Class cho hiệu ứng CSS
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p class="post-meta">Tác giả: ${post.author} | Danh mục: ${post.category_name} | Ngày: ${new Date(post.created_at).toLocaleDateString('vi-VN')}</p>
            <div class="post-content-snippet">${post.content.substring(0, 150)}...</div>
            <a href="Detail.html?id=${post.id}" class="read-more-btn">Đọc thêm</a>
        `;
        postsContainer.appendChild(postElement);
    });
}

// Hàm tải bài viết từ API dựa trên category (hoặc tất cả nếu null)
async function fetchAndDisplayPostsByCategory(categorySlug = null) {
    // --- DÒNG CODE ĐƯỢC CHỈNH SỬA ---
    // Sử dụng đường dẫn tuyệt đối với cổng 3000, dựa trên URL trong trình duyệt của bạn.
    let apiUrl = 'http://localhost:3000/backend/api/post/GetPosts.php';

    if (categorySlug) {
        apiUrl += `?category=${encodeURIComponent(categorySlug)}`;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Cố gắng đọc phản hồi text để hiển thị nội dung lỗi từ server
            const errorText = await response.text();
            throw new Error(`Lỗi HTTP! Status: ${response.status}. Chi tiết phản hồi server: ${errorText.substring(0, 150)}...`);
        }
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) { // Đảm bảo data.data là một mảng
            displayPosts(data.data);
        } else {
            // Nếu data rỗng hoặc không đúng định dạng
            displayPosts([]); 
        }
    } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        showPageErrorMessage(`Đã xảy ra lỗi khi tải bài viết. Vui lòng kiểm tra kết nối hoặc thử lại sau. Chi tiết: ${error.message}`);
    }
}

// --- Hàm khởi tạo cho từng trang cụ thể ---

// Hàm khởi tạo cho trang chủ (Bài viết mới nhất)
function initIndexPage() {
    console.log('initIndexPage() called. Initializing post loading...');
    fetchAndDisplayPostsByCategory(); // Tải tất cả bài viết
}

// Hàm khởi tạo cho trang Sự kiện
function initSuKienPage() {
    console.log('initSuKienPage() called. Loading events...');
    // 'events' là category slug bạn đã định nghĩa trong GetPosts.php mapping
    fetchAndDisplayPostsByCategory('events'); 
}

// Hàm khởi tạo cho trang Tin tức
function initTinTucPage() {
    console.log('initTinTucPage() called. Loading news...');
    // 'news' là category slug bạn đã định nghĩa trong GetPosts.php mapping
    fetchAndDisplayPostsByCategory('news'); 
}

// Bạn cũng có thể định nghĩa các hàm khởi tạo trang khác ở đây
function initGioiThieuPage() {
    console.log('initGioiThieuPage() called. No specific JS actions for this page yet.');
}