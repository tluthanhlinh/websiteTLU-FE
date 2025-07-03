// frontend/public/js/common.js - Chức năng tải trang động (SPA-like) và hiệu ứng

document.addEventListener('DOMContentLoaded', () => {
    const mainContentArea = document.getElementById('main-content-area');
    const mainNavList = document.getElementById('main-nav-list');
    const authLinks = document.querySelectorAll('.auth-link'); // Đăng nhập, Đăng ký
    const logoutNavItem = document.getElementById('logout-nav-item');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Hàm hiển thị thông báo chung (tái sử dụng từ auth.js) ---
    // Cần một #global-message-box trong Index.html nếu muốn dùng chung
    const globalMessageBox = document.getElementById('global-message-box');
    function showGlobalMessage(message, type) {
        if (!globalMessageBox) return;
        globalMessageBox.textContent = message;
        globalMessageBox.className = `message-box ${type}`;
        globalMessageBox.classList.add('show');
        setTimeout(() => {
            globalMessageBox.classList.remove('show');
            setTimeout(() => {
                globalMessageBox.textContent = '';
                globalMessageBox.className = 'message-box';
            }, 500);
        }, 3000); // Ẩn sau 3 giây
    }

    // --- Ánh xạ các hàm khởi tạo script cho từng trang con ---
    // Đảm bảo các script page-specific được gói trong các hàm này
    const pageScripts = {
        'initIndexPage': typeof initIndexPage === 'function' ? initIndexPage : null,
        'initGioiThieuPage': typeof initGioiThieuPage === 'function' ? initGioiThieuPage : null,
        'initSuKienPage': typeof initSuKienPage === 'function' ? initSuKienPage : null,
        'initTinTucPage': typeof initTinTucPage === 'function' ? initTinTucPage : null
        // Thêm các hàm khởi tạo khác ở đây nếu bạn tạo thêm các trang content
    };

    // --- Hàm tải và hiển thị nội dung trang ---
    async function loadPageContent(url, pushState = true) {
        if (!mainContentArea) {
            console.error('Không tìm thấy #main-content-area.');
            return;
        }

        // Cập nhật URL trình duyệt (nếu không phải tải ban đầu)
        if (pushState) {
            // Chuyển đổi tên file content (e.g., index-content.html) thành URL hiển thị (e.g., Index.html)
            const displayUrl = url.replace('-content.html', '.html');
            history.pushState({ path: url }, '', displayUrl);
        }

        // Thêm class 'loading' để hiển thị hiệu ứng tải (nếu có CSS)
        mainContentArea.classList.add('loading-content');
        mainContentArea.style.opacity = '0.5'; // Làm mờ nội dung cũ

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const html = await response.text();

            // Phân tích HTML để chỉ lấy phần nội dung chính
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Tìm phần tử nội dung chính, ví dụ: section.homepage-section hoặc section.page-section
            const newContent = doc.querySelector('.homepage-section, .page-section'); 
            
            if (newContent) {
                // Xóa mọi script và sự kiện cũ trong mainContentArea trước khi thêm nội dung mới
                // để tránh trùng lặp listeners và lỗi JS.
                mainContentArea.innerHTML = ''; 
                mainContentArea.appendChild(newContent);

                // Sau khi nội dung được tải, chạy lại các script cụ thể của trang
                const pageScriptToRun = newContent.dataset.pageScript || mainNavList.querySelector(`a[href="${url}"]`)?.dataset.pageScript;
                if (pageScriptToRun && pageScripts[pageScriptToRun]) {
                    // Đảm bảo script được chạy sau khi DOM được cập nhật
                    setTimeout(() => pageScripts[pageScriptToRun](), 0); 
                }

                // Kích hoạt lại Intersection Observer cho nội dung mới
                reinitializeAnimations();
                updateActiveNavLink(url); // Cập nhật link active
            } else {
                console.error('Không tìm thấy nội dung chính trong HTML tải về:', url);
                mainContentArea.innerHTML = '<p class="error-message">Không thể tải nội dung trang.</p>';
            }

        } catch (error) {
            console.error('Lỗi khi tải trang:', error);
            mainContentArea.innerHTML = '<p class="error-message">Đã xảy ra lỗi khi tải nội dung trang. Vui lòng thử lại sau.</p>';
        } finally {
            mainContentArea.classList.remove('loading-content');
            mainContentArea.style.opacity = '1'; // Trở lại opacity bình thường
        }
    }

    // --- Xử lý sự kiện click trên các liên kết điều hướng ---
    if (mainNavList) {
        mainNavList.querySelectorAll('a').forEach(link => {
            // Chỉ xử lý các link nội bộ trỏ đến các file content-only .html
            if (link.getAttribute('href') && !link.classList.contains('auth-link') && link.getAttribute('href').endsWith('.html')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault(); // Ngăn chặn tải lại trang
                    const targetUrl = e.target.getAttribute('href');
                    loadPageContent(targetUrl);
                });
            }
        });
    }

    // --- Quản lý lịch sử trình duyệt (nút Back/Forward) ---
    window.addEventListener('popstate', (event) => {
        // Tải lại trang dựa trên URL trong lịch sử
        if (event.state && event.state.path) {
            loadPageContent(event.state.path, false); // Không pushState nữa
        } else {
            // Trường hợp tải trang ban đầu hoặc trạng thái không có path
            loadPageContent('index-content.html', false); // Tải trang chủ mặc định
        }
    });

    // --- Khởi tạo trang ban đầu khi tải ứng dụng ---
    // Kiểm tra URL hiện tại để tải nội dung đúng
    const initialPath = window.location.pathname.split('/').pop();
    // Chuyển đổi URL hiển thị thành URL nội dung để tải
    let contentToLoad = 'index-content.html'; // Mặc định là trang chủ

    if (initialPath === 'Index.html' || initialPath === '') {
        contentToLoad = 'index-content.html';
    } else if (initialPath.endsWith('.html')) {
        // Chuyển đổi Login.html -> Login.html, Register.html -> Register.html
        // Đối với các trang content, chuyển MyPage.html -> MyPage-content.html
        if (initialPath.includes('Login.html') || initialPath.includes('Register.html') || initialPath.includes('Detail.html')) {
             // Các trang này tải full HTML, không cần loadPageContent cho nội dung
             // và không cần SPA cho chính chúng
             return; 
        }
        contentToLoad = initialPath.replace('.html', '-content.html');
    }
    
    // Nếu không phải là trang đăng nhập/đăng ký/chi tiết, thì load nội dung
    if (contentToLoad) {
        loadPageContent(contentToLoad, false); // Tải nội dung ban đầu không cần pushState
    }


    // --- Active Nav Link Highlight ---
    function updateActiveNavLink(currentUrl) {
        if (mainNavList) {
            mainNavList.querySelectorAll('li a').forEach(link => {
                link.classList.remove('active');
                const linkHref = link.getAttribute('href');
                
                // So sánh href của link với tên file content hiện tại
                // Hoặc nếu link là index-content.html và currentUrl là index.html (tức trang chủ)
                if (linkHref === currentUrl || 
                   (linkHref === 'index-content.html' && (currentUrl === 'Index.html' || currentUrl === ''))) {
                    link.classList.add('active');
                }
            });
        }
    }

    // --- Quản lý Trạng thái Đăng nhập/Đăng xuất ---
    function updateAuthUI() {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            authLinks.forEach(link => link.style.display = 'none');
            if (logoutNavItem) logoutNavItem.style.display = 'list-item';
        } else {
            authLinks.forEach(link => link.style.display = 'inline-block');
            if (logoutNavItem) logoutNavItem.style.display = 'none';
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_info');
            updateAuthUI();
            showGlobalMessage('Bạn đã đăng xuất thành công!', 'success');
            // Chuyển về trang chủ sau khi đăng xuất
            loadPageContent('index-content.html'); // Tải lại nội dung trang chủ
            history.replaceState({ path: 'Index.html' }, '', 'Index.html'); // Cập nhật URL trình duyệt
        });
    }

    updateAuthUI(); // Gọi khi tải trang để cập nhật UI ban đầu

    // --- Intersection Observer cho Animations (Tái cấu trúc) ---
    // Hàm khởi tạo observer
    let currentObserver = null; // Biến để giữ observer hiện tại

    function reinitializeAnimations() {
        // Nếu có observer cũ, ngắt kết nối nó trước
        if (currentObserver) {
            currentObserver.disconnect();
        }

        const animateOnScrollElements = document.querySelectorAll(
            '.homepage-section, .page-section, .article-item, .page-section h3, .add-post-form'
        );

        const observerOptions = {
            root: null, 
            rootMargin: '0px',
            threshold: 0.1 
        };

        currentObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');

                    // Áp dụng animation cụ thể (lặp lại từ CSS)
                    if (entry.target.classList.contains('homepage-section') || entry.target.classList.contains('page-section') || entry.target.classList.contains('add-post-form')) {
                        entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                    } else if (entry.target.classList.contains('article-item')) {
                        // Thêm delay cho từng item
                        const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                        entry.target.style.animation = `slideInFromBottom 0.6s ease-out ${index * 0.1}s forwards`;
                    } else if (entry.target.tagName === 'H3' && entry.target.closest('.page-section')) {
                        entry.target.style.animation = 'slideInLeft 0.6s ease-out forwards';
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateOnScrollElements.forEach(element => {
            // Đảm bảo opacity ban đầu là 0 và transform ban đầu để animation chạy
            element.style.opacity = '0';
            if (element.classList.contains('homepage-section') || element.classList.contains('page-section') || element.classList.contains('add-post-form')) {
                element.style.transform = 'translateY(30px)';
            } else if (element.classList.contains('article-item')) {
                element.style.transform = 'translateY(50px) scale(0.95)';
            } else if (element.tagName === 'H3' && element.closest('.page-section')) {
                element.style.transform = 'translateX(-60px)';
            }
            currentObserver.observe(element);
        });
    }

    reinitializeAnimations(); // Gọi lần đầu khi trang tải

    // --- Back to Top Button --- (Giữ nguyên từ common.js-code-updated)
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) { 
                backToTopBtn.style.display = 'block';
                setTimeout(() => backToTopBtn.style.opacity = '1', 10); 
            } else {
                backToTopBtn.style.opacity = '0'; 
                setTimeout(() => backToTopBtn.style.display = 'none', 300); 
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
