// frontend/public/js/register.js - Phiên bản nâng cấp

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageBox = document.getElementById('message');
    const submitButton = registerForm ? registerForm.querySelector('.btn-submit') : null;

    // Hàm để hiển thị thông báo
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`; 
        messageBox.classList.add('show'); 
    }

    // Hàm để ẩn thông báo
    function hideMessage() {
        messageBox.classList.remove('show');
        setTimeout(() => {
            messageBox.textContent = '';
            messageBox.className = 'message-box';
        }, 500); 
    }

    // Hàm kiểm tra định dạng email cơ bản
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Hàm kiểm tra độ mạnh mật khẩu (ví dụ: ít nhất 6 ký tự)
    function isStrongPassword(password) {
        return password.length >= 6;
        // Có thể thêm các điều kiện khác:
        // return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            hideMessage(); // Ẩn thông báo cũ
            if (submitButton) {
                submitButton.textContent = 'Đang xử lý...';
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            }

            const fullName = document.getElementById('fullName').value.trim();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            // --- Client-side Validation ---
            if (!fullName || !username || !email || !password || !confirmPassword) {
                showMessage('Vui lòng điền đầy đủ tất cả các trường.', 'error');
                if (submitButton) {
                    submitButton.textContent = 'Đăng Ký';
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
                return;
            }

            if (!isValidEmail(email)) {
                showMessage('Địa chỉ email không hợp lệ.', 'error');
                if (submitButton) {
                    submitButton.textContent = 'Đăng Ký';
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
                return;
            }

            if (!isStrongPassword(password)) {
                showMessage('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
                if (submitButton) {
                    submitButton.textContent = 'Đăng Ký';
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Mật khẩu và xác nhận mật khẩu không khớp!', 'error');
                if (submitButton) {
                    submitButton.textContent = 'Đăng Ký';
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
                return;
            }
            // --- End Client-side Validation ---

            const userData = {
                username: username,
                email: email,
                password: password,
                full_name: fullName,
                role: 'user' 
            };

            try {
                const API_URL = 'http://localhost/webxudoan/backend/api/users/Register.php';

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json(); 

                if (response.ok) {
                    showMessage(data.message || 'Đăng ký thành công! Đang chuyển hướng...', 'success');
                    setTimeout(() => {
                        window.location.href = 'Login.html'; 
                    }, 2000); 
                } else {
                    showMessage(data.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
                    console.error('Lỗi đăng ký:', data.message);
                }
            } catch (error) {
                showMessage('Đã xảy ra lỗi mạng. Vui lòng kiểm tra kết nối.', 'error');
                console.error('Lỗi fetch:', error);
            } finally {
                // Luôn reset trạng thái nút sau khi hoàn thành request (thành công hoặc thất bại)
                if (submitButton && !window.location.href.includes('Login.html')) { // Chỉ reset nếu không chuyển hướng
                    submitButton.textContent = 'Đăng Ký';
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
            }
        });
    } else {
        console.error('Không tìm thấy form đăng ký.');
    }
});
