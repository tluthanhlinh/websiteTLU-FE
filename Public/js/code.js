// code.js

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------
    // Các phần tử UI chung
    // -----------------------------------------------------
    const backToTopBtn = document.getElementById('backToTopBtn');
    const navLinks = document.querySelectorAll('.main-nav-links ul li a');
    const loginLinkNavLi = document.getElementById('loginOrLogoutNav'); // Li chứa link Đăng nhập/Đăng xuất
    const addArticleLink = document.getElementById('addArticleLink'); // Link Đăng Bài
    const currentPath = window.location.pathname.split('/').pop();

    // -----------------------------------------------------
    // Helper function để hiển thị thông báo
    // -----------------------------------------------------
    function showMessage(messageElement, message, type) {
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.className = 'message-box show'; // Reset class và thêm 'show'
        if (type === 'success') {
            messageElement.classList.add('success');
        } else if (type === 'error') {
            messageElement.classList.add('error');
        }

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            messageElement.classList.remove('show');
            // Xóa nội dung và loại bỏ class type sau khi ẩn hoàn toàn
            setTimeout(() => {
                messageElement.textContent = '';
                messageElement.className = 'message-box';
            }, 500); // Thời gian này khớp với transition duration trong CSS
        }, 5000);
    }

    // -----------------------------------------------------
    // 1. Logic cho nút "Back to Top" (Cuộn lên đầu trang)
    // -----------------------------------------------------
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { 
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' 
            });
        });
    }

    // -----------------------------------------------------
    // 2. Logic để đánh dấu menu active & quản lý Đăng nhập/Đăng xuất
    // -----------------------------------------------------

    // Đảm bảo đường dẫn này đúng với nơi bạn đặt file PHP backend trên XAMPP
    const API_BASE_URL = 'https://websitetlu-backend-.onrender.com/'; // <-- Dán URL backend Render vào đây
    function updateLoginUI(isLoggedInStatus) {
        if (!loginLinkNavLi) return; // Thoát nếu không tìm thấy phần tử

        // Xóa nội dung hiện tại của li và tạo lại
        loginLinkNavLi.innerHTML = ''; 

        if (isLoggedInStatus) {
            // Nếu đã đăng nhập: Hiển thị nút Đăng Xuất
            const logoutButton = document.createElement('button');
            logoutButton.id = 'logoutButton';
            logoutButton.classList.add('nav-link-button');
            logoutButton.textContent = 'Đăng Xuất';
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('userToken'); // Xóa token
                updateLoginUI(false); // Cập nhật UI
                showMessage(document.getElementById('loginMessage') || document.getElementById('registerMessage') || document.createElement('div'), 'Bạn đã đăng xuất thành công!', 'success');
                window.location.href = 'Index.html'; // Chuyển về trang chủ
            });
            loginLinkNavLi.appendChild(logoutButton);
            if (addArticleLink) addArticleLink.style.display = 'inline-flex';
        } else {
            // Nếu chưa đăng nhập: Hiển thị link Đăng Nhập
            const loginLink = document.createElement('a');
            loginLink.href = 'Login.html';
            loginLink.textContent = 'Đăng Nhập';
            if (currentPath === 'Login.html') {
                loginLink.classList.add('active'); // Đánh dấu active nếu đang ở trang Login
            }
            loginLinkNavLi.appendChild(loginLink);
            if (addArticleLink) addArticleLink.style.display = 'none';
        }
    }

    // Đánh dấu link nav active dựa trên currentPath
    navLinks.forEach(link => {
        const linkPath = link.href.split('/').pop();
        if (linkPath === currentPath || (currentPath === '' && linkPath === 'Index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); 
        }
    });

    // Kiểm tra trạng thái đăng nhập khi DOMContentLoaded
    const initialLoginStatus = localStorage.getItem('userToken') ? true : false;
    updateLoginUI(initialLoginStatus);


    // -----------------------------------------------------
    // 3. Logic tải bài viết từ API (Trang Chủ, Sự Kiện, Tin Tức)
    // -----------------------------------------------------
    async function fetchArticles(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return; 

        container.innerHTML = '<p class="loading-message">Đang tải bài viết...</p>'; 

        try {
            const response = await fetch(`${API_BASE_URL}GetPosts.php?category=${category}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                container.innerHTML = `<p class="error-message">Lỗi khi tải bài viết: ${response.status} - ${response.statusText}. Vui lòng kiểm tra console để biết chi tiết.</p>`;
                return;
            }

            const articles = await response.json(); 

            if (articles && articles.length > 0) {
                container.innerHTML = ''; 
                articles.forEach(article => {
                    const articleDiv = document.createElement('div');
                    articleDiv.classList.add('article-item');
                    
                    const title = article.title; 
                    const contentSnippet = article.content ? article.content.substring(0, 150) + '...' : '';
                    const imageUrl = article.image_url ? article.image_url : 'https://placehold.co/400x200/cccccc/333333?text=No+Image'; 

                    articleDiv.innerHTML = `
                        <h3>${title}</h3>
                        <p class="date-info">Ngày đăng: ${new Date(article.created_at).toLocaleDateString('vi-VN')}</p>
                        <p>${contentSnippet}</p>
                        <a href="Detail.html?id=${article.id}" class="read-more">Đọc thêm</a>
                    `;
                    container.appendChild(articleDiv);
                });
            } else {
                container.innerHTML = '<p class="error-message">Chưa có bài viết nào trong mục này.</p>';
            }
        } catch (error) {
            console.error('Lỗi khi fetch data:', error);
            container.innerHTML = '<p class="error-message">Không thể tải bài viết. Vui lòng thử lại sau.</p>';
        }
    }

    // Tải bài viết khi trang được load, tùy thuộc vào trang hiện tại
    if (currentPath === 'Index.html' || currentPath === '') {
        fetchArticles('news', 'newsArticles'); 
        fetchArticles('events', 'eventArticles'); 
    } else if (currentPath === 'Events.html') {
        fetchArticles('events', 'eventArticlesList'); 
    } else if (currentPath === 'News.html') {
        fetchArticles('news', 'newsArticlesList'); 
    }

    // -----------------------------------------------------
    // 4. Logic cho trang chi tiết bài viết (Detail.html)
    // -----------------------------------------------------
    async function fetchSingleArticle() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        const articleDetailContainer = document.querySelector('.article-detail-section'); 

        if (!articleId || !articleDetailContainer) {
            if (articleDetailContainer) {
                articleDetailContainer.innerHTML = '<p class="error-message">Không tìm thấy ID bài viết hoặc container chi tiết.</p>';
            }
            return;
        }

        articleDetailContainer.innerHTML = '<p class="loading-message">Đang tải bài viết chi tiết...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}GetSinglePost.php?id=${articleId}`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const article = await response.json();

            if (article) {
                const title = article.title; 
                const content = article.content; 
                const author = article.author_name || 'Admin';
                const date = new Date(article.created_at).toLocaleDateString('vi-VN');
                const imageUrl = article.image_url ? article.image_url : ''; 

                articleDetailContainer.innerHTML = `
                    <h1>${title}</h1>
                    <p class="author-date">Đăng bởi ${author} vào ngày ${date}</p>
                    ${imageUrl ? `<img src="${imageUrl}" alt="${title}">` : ''}
                    <div class="full-content">
                        ${content}
                    </div>
                    <a href="javascript:history.back()" class="back-link">Quay lại</a>
                `;
            } else {
                articleDetailContainer.innerHTML = '<p class="error-message">Không tìm thấy bài viết này.</p>';
            }
        } catch (error) {
            console.error('Lỗi khi tải bài viết chi tiết:', error);
            articleDetailContainer.innerHTML = '<p class="error-message">Không thể tải bài viết chi tiết. Vui lòng thử lại sau.</p>';
        }
    }

    // Gọi hàm fetchSingleArticle nếu đang ở trang Detail.html
    if (currentPath === 'Detail.html') {
        fetchSingleArticle();
    }

    // -----------------------------------------------------
    // 5. Logic cho trang Login.html
    // -----------------------------------------------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginMessage = document.getElementById('loginMessage');
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            const username = loginForm.username.value.trim();
            const password = loginForm.password.value;

            if (!username || !password) {
                showMessage(loginMessage, 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}Login.php`, { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('userToken', result.token); // Lưu token (hoặc bất kỳ dấu hiệu đăng nhập nào)
                    showMessage(loginMessage, 'Đăng nhập thành công!', 'success');
                    // Chờ animation hoàn tất rồi mới chuyển trang
                    setTimeout(() => {
                        window.location.href = 'Index.html'; 
                    }, 1000); 
                } else {
                    showMessage(loginMessage, 'Đăng nhập thất bại: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi đăng nhập:', error);
                showMessage(loginMessage, 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại.', 'error');
            }
        });
    }

    // -----------------------------------------------------
    // 6. Logic cho trang Register.html
    // -----------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const registerMessage = document.getElementById('registerMessage');
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = registerForm.regUsername.value.trim();
            const password = registerForm.regPassword.value;
            const confirmPassword = registerForm.regConfirmPassword.value;

            if (!username || !password || !confirmPassword) {
                showMessage(registerMessage, 'Vui lòng điền đầy đủ các trường.', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage(registerMessage, 'Mật khẩu phải có ít nhất 6 ký tự.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage(registerMessage, 'Mật khẩu xác nhận không khớp.', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}Register.php`, { // Sẽ tạo file Register.php
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(registerMessage, 'Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                    registerForm.reset(); // Xóa form sau khi đăng ký thành công
                    // Chờ animation hoàn tất rồi mới chuyển trang
                    setTimeout(() => {
                        window.location.href = 'Login.html'; 
                    }, 1000); 
                } else {
                    showMessage(registerMessage, 'Đăng ký thất bại: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi đăng ký:', error);
                showMessage(registerMessage, 'Có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.', 'error');
            }
        });
    }

    // -----------------------------------------------------
    // 7. Logic cho trang AddPost.html
    // -----------------------------------------------------
    const addPostForm = document.getElementById('addPostForm');
    if (addPostForm) {
        const addPostMessage = document.getElementById('message'); // Lấy element message đã có
        const addPostErrorMessage = document.getElementById('error-message'); // Lấy element error-message đã có

        addPostForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title = addPostForm.title.value;
            const content = addPostForm.content.value;
            const category = addPostForm.category.value;
            const author = addPostForm.author.value;
            const imageUrl = addPostForm.imageUrl.value;

            try {
                const response = await fetch(`${API_BASE_URL}AddPost.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title, content, category, author, image_url: imageUrl })
                });

                const result = await response.json();

                if (result.success) {
                    showMessage(addPostMessage, 'Đăng bài thành công!', 'success');
                    addPostForm.reset(); 
                } else {
                    showMessage(addPostErrorMessage, 'Đăng bài thất bại: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Lỗi khi đăng bài:', error);
                showMessage(addPostErrorMessage, 'Có lỗi xảy ra trong quá trình đăng bài. Vui lòng thử lại.', 'error');
            }
        });
    }

}); // Kết thúc DOMContentLoaded
