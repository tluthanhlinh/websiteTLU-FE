// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
    // Ghi log để xác nhận rằng tệp JavaScript đã được tải và DOM đã sẵn sàng.
    console.log("login.js: DOM Content Loaded. Attaching event listener.");

    // ĐỊNH NGHĨA URL GỐC CỦA DỰ ÁN CỦA BẠN.
    // Đảm bảo rằng 'webxudoan' là tên thư mục chứa dự án PHP của bạn trong htdocs.
    // Đây là BASE_URL cho các yêu cầu API.
    const BASE_URL = 'http://localhost/webxudoan'; 

    // Lấy tham chiếu đến form đăng nhập bằng ID của nó.
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        // Ghi lỗi nếu không tìm thấy form, điều này có thể chỉ ra lỗi trong HTML.
        console.error("login.js: Login form with ID 'loginForm' not found.");
        return; // Dừng thực thi nếu không có form.
    }
    // Xác nhận rằng form đã được tìm thấy và trình nghe sự kiện sẽ được gắn vào.
    console.log("login.js: Login form found. Attaching submit event listener.");

    // Gắn trình nghe sự kiện 'submit' vào form đăng nhập.
    loginForm.addEventListener('submit', async (event) => {
        // Ngăn chặn hành vi gửi form mặc định của trình duyệt để xử lý bằng JavaScript.
        event.preventDefault(); 
        console.log("login.js: Form submission intercepted.");

        // Lấy giá trị từ các trường nhập liệu username/email và password.
        // Đảm bảo ID của các phần tử nhập liệu khớp với HTML của bạn.
        const usernameOrEmail = document.getElementById('usernameOrEmail').value; 
        const password = document.getElementById('password').value;

        // Kiểm tra xem các trường nhập liệu có trống không.
        if (!usernameOrEmail || !password) {
            console.warn("login.js: Username/Email or password is empty.");
            // Hiển thị thông báo lỗi cho người dùng.
            displayMessage("Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.", 'error');
            return; // Dừng xử lý nếu các trường trống.
        }

        // Tạo đối tượng dữ liệu sẽ gửi đến API đăng nhập.
        const loginData = {
            username_or_email: usernameOrEmail, // Gửi đúng tên biến mà backend mong đợi.
            password: password
        };
        // Ghi log chi tiết về yêu cầu sẽ được gửi.
        console.log("login.js: Sending Login request to:", `${BASE_URL}/backend/api/users/Login.php`);
        console.log("login.js: Request body:", loginData);

        try {
            // Gửi yêu cầu POST đến API đăng nhập.
            const response = await fetch(`${BASE_URL}/backend/api/users/Login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Chỉ định loại nội dung là JSON.
                },
                body: JSON.stringify(loginData) // Chuyển đổi dữ liệu thành chuỗi JSON.
            });

            // Kiểm tra xem phản hồi HTTP có thành công không (status code 2xx).
            if (!response.ok) {
                // Nếu phản hồi không thành công, đọc văn bản phản hồi thô.
                const errorText = await response.text(); 
                console.error("login.js: HTTP Error:", response.status, response.statusText, "Raw response:", errorText);
                try {
                    // Cố gắng phân tích văn bản lỗi thành JSON để lấy thông báo cụ thể.
                    const errorJson = JSON.parse(errorText);
                    displayMessage(errorJson.message || "Lỗi server: Phản hồi không hợp lệ.", 'error');
                } catch (e) {
                    // Nếu không thể phân tích JSON, hiển thị thông báo lỗi chung.
                    displayMessage("Đăng nhập thất bại do lỗi không xác định từ server.", 'error');
                }
                return; // Dừng nếu có lỗi HTTP.
            }

            // Phân tích phản hồi JSON từ server.
            const data = await response.json();
            console.log("login.js: API Response (parsed JSON):", data);

            // Kiểm tra thuộc tính 'success' trong phản hồi JSON.
            if (data.success) {
                console.log("login.js: Login successful. Data received:", data);
                displayMessage(data.message, 'success');

                // Lưu JWT token và thông tin người dùng vào localStorage để sử dụng sau này.
                localStorage.setItem('jwt_token', data.jwt_token);
                localStorage.setItem('user_info', JSON.stringify(data.user_info)); 

                // --- ĐIỀU HƯỚNG DỰA TRÊN data.redirectUrl TỪ BACKEND ---
                // Đây là phần quan trọng đã được sửa đổi: sử dụng trực tiếp URL trả về từ backend.
                if (data.redirectUrl) {
                    console.log("login.js: Redirecting to:", data.redirectUrl);
                    window.location.href = data.redirectUrl; // Chuyển hướng trình duyệt đến URL này.
                } else {
                    // Trường hợp không có redirectUrl được cung cấp, chuyển hướng đến trang mặc định.
                    console.warn("login.js: No redirectUrl found in API response. Defaulting to public index.");
                    window.location.href = `${BASE_URL}/frontend/Public/Index.html`; 
                }

            } else {
                // Nếu API trả về success: false, hiển thị thông báo lỗi từ server.
                console.log("login.js: Login failed (API returned success: false):", data.message);
                displayMessage(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.", 'error');
            }
        } catch (error) {
            // Bắt các lỗi mạng hoặc lỗi phân tích JSON.
            console.error("login.js: Fetch error (network or JSON parse):", error);
            displayMessage("Có lỗi xảy ra khi kết nối đến máy chủ. Vui lòng thử lại.", 'error');
        }
    });

    // Hàm hiển thị thông báo trên giao diện người dùng.
      function displayMessage(message, type) {
        // *** THÊM DÒNG NÀY ĐỂ DEBUG ***
        console.log(`displayMessage called: Message="${message}", Type="${type}"`);

        let messageBox = document.getElementById('message');
        if (!messageBox) {
            console.error("login.js: Message box with ID 'message' not found.");
            messageBox = document.createElement('div');
            messageBox.id = 'message';
            document.body.prepend(messageBox);
        }

        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.className = 'message-box';
        if (type === 'success') {
            messageBox.classList.add('success');
        } else if (type === 'error') {
            messageBox.classList.add('error');
        }

        // Tự động ẩn message box sau 5 giây.
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }
});
