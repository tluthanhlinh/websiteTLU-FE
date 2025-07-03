// frontend/js/posts.js

document.addEventListener('DOMContentLoaded', async () => {
    const postsListDiv = document.getElementById('postsList');
    const createPostSection = document.querySelector('.create-post-section'); // Lấy phần hiển thị nút thêm bài

    if (!postsListDiv) {
        console.error('Không tìm thấy phần tử #postsList.');
        return;
    }

    // Hiển thị thông báo đang tải
    postsListDiv.innerHTML = '<div class="loading-message">Đang tải bài viết...</div>';

    // Kiểm tra quyền hạn để hiển thị nút "Thêm bài viết mới"
    const userRole = localStorage.getItem('user_role'); // Giả định bạn lưu role ở đây khi đăng nhập
    if (userRole === 'admin') { // Hoặc bất kỳ vai trò nào có quyền tạo bài
        if (createPostSection) {
            createPostSection.style.display = 'block'; // Hiển thị nút
            document.getElementById('createPostBtn').addEventListener('click', () => {
                window.location.href = 'create-post.html'; // Chuyển hướng đến trang tạo bài
            });
        }
    }


    try {
        // ĐẢM BẢO ĐƯỜNG DẪN NÀY TRỎ ĐÚNG ĐẾN GetPosts.php CỦA BẠN
        const response = await fetch('http://localhost/webxudoan/backend/api/post/GetPosts.php');
        const data = await response.json();

        if (response.ok && data.data && data.data.length > 0) {
            postsListDiv.innerHTML = ''; // Xóa thông báo đang tải

            data.data.forEach(post => {
                const postItem = document.createElement('div');
                postItem.classList.add('article-item');

                const createdAt = new Date(post.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                postItem.innerHTML = `
                    <div class="article-header">
                        <h3>${post.title}</h3>
                        <p class="date-info">Ngày đăng: ${createdAt} | Tác giả: ${post.author} | Danh mục: <span class="math-inline">\{post\.category\_name\}</p\>
</div>
<div class="article-content">
<p>{post.content.substring(0, 200)}...</p>
<a href="post-detail.html?id=post.id"class="read−more">Đọcth 
e
^
 m</a></div><divclass="article−actions"style="display:none;"><buttonclass="btn−edit"data−id="{post.id}">Sửa</button>
<button class="btn-delete" data-id="${post.id}">Xóa</button>
</div>
`;
postsListDiv.appendChild(postItem);

                // Hiển thị nút sửa/xóa nếu là admin
                if (userRole === 'admin') {
                    const actionsDiv = postItem.querySelector('.article-actions');
                    if (actionsDiv) {
                        actionsDiv.style.display = 'flex'; // Hoặc 'block'
                        // Thêm sự kiện cho nút sửa/xóa (sẽ code sau)
                        actionsDiv.querySelector('.btn-edit').addEventListener('click', (e) => {
                            const postId = e.target.dataset.id;
                            window.location.href = `edit-post.html?id=${postId}`;
                        });
                        actionsDiv.querySelector('.btn-delete').addEventListener('click', (e) => {
                            const postId = e.target.dataset.id;
                            if (confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                                deletePost(postId);
                            }
                        });
                    }
                }
            });
        } else {
            postsListDiv.innerHTML = '<div class="error-message">' + (data.message || 'Không có bài viết nào để hiển thị.') + '</div>';
        }

    } catch (error) {
        console.error('Lỗi khi tải bài viết:', error);
        postsListDiv.innerHTML = '<div class="error-message">Đã xảy ra lỗi khi tải bài viết. Vui lòng thử lại sau.</div>';
    }

    // Hàm xóa bài viết (chúng ta sẽ triển khai API và logic này sau)
    async function deletePost(postId) {
        try {
            const token = localStorage.getItem('jwt_token'); // Cần token để xác thực
            if (!token) {
                alert('Bạn cần đăng nhập để thực hiện thao tác này.');
                return;
            }

            const response = await fetch('http://localhost/webxudoan/backend/api/post/DeletePost.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Gửi token lên server để xác thực
                },
                body: JSON.stringify({ id: postId })
            });

            const result = await response.json();

            if (response.ok && result.message) {
                alert(result.message);
                location.reload(); // Tải lại trang để cập nhật danh sách
            } else {
                alert(result.message || 'Xóa bài viết thất bại.');
            }
        } catch (error) {
            console.error('Lỗi khi xóa bài viết:', error);
            alert('Đã xảy ra lỗi khi xóa bài viết.');
        }
    }
});