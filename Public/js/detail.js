// frontend_vercel/public/js/detail.js

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id'); // Lấy ID bài viết từ URL

    const articleTitle = document.getElementById('article-title');
    const articleMeta = document.getElementById('article-meta');
    const articleImage = document.getElementById('article-image');
    const articleContent = document.getElementById('article-content');

    // Dữ liệu bài viết giả định (thay thế bằng dữ liệu từ backend sau này)
    const articles = [
        {
            id: '1',
            title: 'Khóa Huấn Luyện Huynh Trưởng Cấp I: "Mặt Trời Công Chính"',
            author: 'Ban Truyền Thông',
            date: '20/06/2025',
            imageUrl: 'images/event1.jpg', // Thay bằng ảnh có sẵn của bạn
            fullContent: `
                <p>Vào những ngày đầu tháng 6, khí trời nóng bức như muốn thử thách ý chí của các sa mạc sinh (SMS). Nhưng không gì có thể dập tắt được ngọn lửa nhiệt huyết trong trái tim của các Huynh Trưởng tương lai.</p>
                <p>Khóa Huấn Luyện Huynh Trưởng Cấp I với chủ đề "Mặt Trời Công Chính" đã chính thức khai mạc, quy tụ gần 100 SMS đến từ các giáo xứ khác nhau trong Giáo phận. Đây là một hành trình đầy thử thách nhưng cũng không kém phần ý nghĩa, nơi các bạn trẻ được trang bị kiến thức, kỹ năng và tôi luyện tinh thần để trở thành những người dẫn dắt Thiếu Nhi Thánh Thể trong tương lai.</p>
                <h3>Hành Trình Rèn Luyện</h3>
                <p>Trong suốt khóa học, các SMS đã trải qua nhiều hoạt động đa dạng: từ những buổi học lý thuyết về giáo lý, phương pháp giáo dục, kỹ năng tổ chức trò chơi, đến những giờ thực hành sinh động, các buổi tĩnh tâm và phụng vụ trang nghiêm. Mỗi hoạt động đều được thiết kế nhằm giúp SMS phát triển toàn diện cả về tri thức, thể chất và đời sống tâm linh.</p>
                <p>Đặc biệt, các buổi chia sẻ kinh nghiệm từ các anh chị Huynh Trưởng đi trước đã mang lại nhiều bài học quý giá, giúp SMS hình dung rõ hơn về vai trò và trách nhiệm của một Huynh Trưởng.</p>
                <h3>Tinh Thần Hiệp Nhất</h3>
                <p>Không chỉ là nơi học hỏi, Khóa Huấn Luyện còn là môi trường để các SMS xây dựng tình bạn, tình huynh đệ. Những buổi sinh hoạt chung, các trò chơi lớn, hay đơn giản là những bữa ăn cùng nhau đã gắn kết mọi người lại thành một khối. Tinh thần "Hy Sinh - Cầu Nguyện - Rước Lễ - Làm Việc Tông Đồ" của Thiếu Nhi Thánh Thể đã được thể hiện rõ nét qua sự tương trợ, động viên lẫn nhau giữa các SMS.</p>
                <h3>Kết Thúc Mở Ra Một Khởi Đầu Mới</h3>
                <p>Lễ Bế Giảng đã diễn ra trong không khí trang trọng và xúc động. Các SMS được trao chứng chỉ hoàn thành khóa học, đánh dấu một cột mốc quan trọng trong hành trình phụng sự Chúa và Giáo Hội. Đây không chỉ là sự kết thúc của một khóa huấn luyện, mà còn là khởi đầu cho một sứ mệnh mới, một lời mời gọi dấn thân vào công tác Thiếu Nhi Thánh Thể.</p>
                <p>Chúc các tân Huynh Trưởng luôn giữ vững ngọn lửa nhiệt huyết, trở thành những "Mặt Trời Công Chính" chiếu soi ánh sáng đức tin và tình yêu đến các em Thiếu Nhi, góp phần xây dựng một thế hệ trẻ Kitô hữu vững mạnh.</p>
                <p>***</p>
                <p>Mọi thắc mắc và góp ý, xin vui lòng liên hệ Ban Tổ Chức để được hỗ trợ.</p>
            `
        },
        {
            id: '2',
            title: 'Lễ Bế Giảng và Trao Chứng Chỉ Khóa Học Giáo Lý 2024',
            author: 'Cha Xứ Phêrô Nguyễn Văn A',
            date: '15/05/2025',
            imageUrl: 'images/event2.jpg', // Thay bằng ảnh có sẵn của bạn
            fullContent: `
                <p>Vào Chúa Nhật vừa qua, Giáo xứ chúng ta đã hân hoan tổ chức Lễ Bế Giảng và Trao Chứng Chỉ cho các em học sinh đã hoàn thành xuất sắc các khóa học Giáo Lý năm 2024.</p>
                <p>Thánh Lễ được cử hành trọng thể dưới sự chủ tế của Cha Xứ Phêrô Nguyễn Văn A, cùng với sự hiện diện đông đảo của quý Phụ huynh, quý Thầy Cô Giáo Lý Viên và toàn thể cộng đoàn dân Chúa. Trong bài giảng, Cha Xứ đã nhấn mạnh tầm quan trọng của việc học hỏi và sống Lời Chúa, đồng thời biểu dương tinh thần ham học hỏi của các em.</p>
                <h3>Niềm Vui Lan Tỏa</h3>
                <p>Sau Thánh Lễ, buổi lễ trao chứng chỉ diễn ra trong không khí trang trọng và tràn ngập niềm vui. Từng em học sinh với vẻ mặt rạng rỡ đã tiến lên nhận chứng chỉ từ tay Cha Xứ và quý Thầy Cô. Những tràng pháo tay vang dội như là lời chúc mừng và động viên cho những nỗ lực không ngừng của các em trong suốt một năm học qua.</p>
                <p>Đây không chỉ là sự công nhận về kiến thức đã học, mà còn là dấu ấn cho sự trưởng thành về đức tin và nhân cách của mỗi em. Hy vọng rằng, với hành trang đã được trang bị, các em sẽ tiếp tục lớn lên trong ân sủng và trở thành những chứng nhân sống động của Chúa trong cuộc sống hằng ngày.</p>
                <h3>Lời Cảm Ơn</h3>
                <p>Ban Tổ Chức xin chân thành cảm ơn quý Cha, quý Thầy Cô Giáo Lý Viên đã tận tâm giảng dạy, quý Phụ huynh đã luôn đồng hành và tạo điều kiện cho các em. Đặc biệt, xin chúc mừng tất cả các em học sinh đã hoàn thành khóa học. Chúc các em luôn bình an và tiến bước trên con đường đức tin.</p>
            `
        },
        {
            id: '3',
            title: 'Hành Trình Mùa Chay: Cùng Các Em Thiếu Nhi Sống Đức Tin',
            author: 'Chị Maria B',
            date: '10/03/2025',
            imageUrl: 'images/event3.jpg', // Thay bằng ảnh có sẵn của bạn
            fullContent: `
                <p>Mùa Chay là thời gian đặc biệt để mỗi Kitô hữu nhìn lại bản thân, sám hối và canh tân đời sống đức tin. Hòa cùng nhịp sống của Giáo Hội, các em Thiếu Nhi Thánh Thể trong Xứ Đoàn chúng ta cũng đã có những hoạt động ý nghĩa để sống trọn vẹn Mùa Chay Thánh.</p>
                <p>Từ những buổi cầu nguyện chung, tham gia chặng đàng Thánh Giá, đến các việc hy sinh nhỏ bé hằng ngày như tiết kiệm tiền quà để giúp đỡ người nghèo, các em đã được hướng dẫn để hiểu và thực hành ý nghĩa của Mùa Chay.</p>
                <h3>Học Hỏi Qua Hoạt Động</h3>
                <p>Các buổi sinh hoạt giáo lý trong Mùa Chay được lồng ghép các câu chuyện về cuộc khổ nạn của Chúa Giêsu, giúp các em dễ dàng nắm bắt những bài học về tình yêu, sự tha thứ và lòng bác ái. Bên cạnh đó, các trò chơi mang tính giáo dục cũng giúp các em ghi nhớ các điều răn và giáo huấn của Giáo Hội một cách vui tươi, sống động.</p>
                <p>Nhiều em đã tích cực tham gia các hoạt động bác ái, quyên góp sách vở, quần áo cũ cho các bạn có hoàn cảnh khó khăn. Đây là những hành động cụ thể giúp các em nhận ra rằng Mùa Chay không chỉ là việc giữ chay hãm mình, mà còn là hành động yêu thương, sẻ chia với những người kém may mắn hơn.</p>
                <h3>Trưởng Thành Trong Đức Tin</h3>
                <p>Qua những ngày tháng sống Mùa Chay đầy ý nghĩa này, các em Thiếu Nhi không chỉ được học hỏi về giáo lý mà còn được rèn luyện ý chí, vun đắp lòng đạo đức. Hy vọng rằng, những hạt giống đức tin đã được gieo trồng trong Mùa Chay sẽ nảy nở và mang lại nhiều hoa trái thiêng liêng trong cuộc sống của các em.</p>
                <p>Xin Chúa chúc lành cho tất cả các em và gia đình, để mỗi người chúng ta luôn là những người con ngoan của Chúa, biết yêu thương và phục vụ tha nhân.</p>
            `
        },
        {
            id: '4',
            title: 'Ngày Hội Văn Hóa Thiếu Nhi 2025: Sắc Màu Yêu Thương',
            author: 'Ban Văn Hóa Xứ Đoàn',
            date: '05/02/2025',
            imageUrl: 'images/event4.jpg', // Thay bằng ảnh có sẵn của bạn
            fullContent: `
                <p>Ngày Hội Văn Hóa Thiếu Nhi 2025 đã diễn ra thành công tốt đẹp, mang đến một không gian tràn ngập sắc màu, tiếng cười và tình yêu thương cho các em Thiếu Nhi trong toàn Giáo phận. Sự kiện được tổ chức nhằm tạo sân chơi bổ ích, phát huy năng khiếu và gắn kết các em trong tinh thần huynh đệ Kitô giáo.</p>
                <p>Với chủ đề "Sắc Màu Yêu Thương", ngày hội đã quy tụ hàng trăm em Thiếu Nhi tham gia vào các gian hàng trò chơi dân gian, các tiết mục văn nghệ đặc sắc, và khu vực triển lãm tranh vẽ đầy sáng tạo. Mỗi góc nhỏ của ngày hội đều thể hiện sự chuẩn bị công phu và nhiệt huyết của các anh chị Huynh Trưởng.</p>
                <h3>Hoạt Động Nổi Bật</h3>
                <ul>
                    <li>**Gian hàng trò chơi dân gian:** Các em được trải nghiệm những trò chơi truyền thống như nhảy sạp, ô ăn quan, kéo co, mang lại tiếng cười sảng khoái và tinh thần đoàn kết.</li>
                    <li>**Sân khấu văn nghệ:** Những màn trình diễn ca múa nhạc, kịch ngắn về các chủ đề đạo đức, lòng bác ái đã nhận được sự cổ vũ nhiệt tình từ khán giả. Các em đã tự tin thể hiện tài năng của mình.</li>
                    <li>**Khu vực triển lãm tranh:** Hàng trăm bức tranh với những nét vẽ ngây thơ, trong sáng, thể hiện tình yêu Chúa, yêu quê hương và bạn bè đã được trưng bày, tạo nên một không gian nghệ thuật đầy ý nghĩa.</li>
                    <li>**Gian hàng ẩm thực:** Các món ăn vặt và nước uống được chuẩn bị cẩn thận, góp phần tạo nên không khí lễ hội ấm cúng.</li>
                </ul>
                <h3>Kết Nối Và Chia Sẻ</h3>
                <p>Ngày Hội Văn Hóa không chỉ là dịp để các em vui chơi mà còn là cơ hội để các Xứ Đoàn giao lưu, học hỏi lẫn nhau. Tinh thần hiệp nhất và yêu thương đã lan tỏa khắp không gian, làm cho ngày hội thực sự trở thành một "sắc màu yêu thương" đúng như chủ đề.</p>
                <p>Ban Tổ Chức xin gửi lời cảm ơn sâu sắc đến quý Cha, quý Thầy Cô Giáo Lý Viên, quý Phụ huynh, và đặc biệt là toàn thể các em Thiếu Nhi đã góp phần tạo nên một ngày hội đáng nhớ. Hy vọng rằng, những ký ức đẹp này sẽ là hành trang quý giá cho các em trên con đường sống đức tin và phụng sự Chúa.</p>
            `
        },
        {
            id: '5',
            title: 'Buổi Tĩnh Tâm Mùa Vọng Của Huynh Trưởng: "Vun Đắp Đời Sống Nội Tâm"',
            author: 'Cha Giuse Trần Văn B',
            date: '01/12/2024',
            imageUrl: 'images/event5.jpg', // Thay bằng ảnh có sẵn của bạn
            fullContent: `
                <p>Trong không khí linh thiêng của Mùa Vọng, các anh chị Huynh Trưởng trong Xứ Đoàn đã cùng nhau tham dự buổi tĩnh tâm đặc biệt với chủ đề "Vun Đắp Đời Sống Nội Tâm". Đây là cơ hội quý báu để mỗi Huynh Trưởng lắng đọng tâm hồn, chuẩn bị đón mừng Chúa Giáng Sinh và củng cố đời sống thiêng liêng.</p>
                <p>Buổi tĩnh tâm do Cha Giuse Trần Văn B hướng dẫn, bắt đầu bằng giờ Chầu Thánh Thể sốt sắng, tiếp đến là bài chia sẻ sâu sắc của Cha về ý nghĩa của Mùa Vọng và tầm quan trọng của việc nuôi dưỡng đời sống nội tâm trong sứ vụ Huynh Trưởng.</p>
                <h3>Những Gợi Ý Cho Đời Sống Nội Tâm</h3>
                <p>Cha Giuse đã gợi mở nhiều cách thức để các Huynh Trưởng có thể vun đắp đời sống nội tâm giữa bộn bề công việc và sứ vụ:</p>
                <ul>
                    <li>**Cầu nguyện cá nhân:** Dành thời gian mỗi ngày để trò chuyện với Chúa, đọc và suy gẫm Lời Chúa.</li>
                    <li>**Lắng nghe Chúa trong công việc:** Nhận ra sự hiện diện của Chúa trong từng công việc phục vụ các em Thiếu Nhi.</li>
                    <li>**Thực hành tĩnh lặng:** Tìm những khoảnh khắc yên tĩnh để đối diện với chính mình và lắng nghe tiếng Chúa.</li>
                    <li>**Thường xuyên lãnh nhận các Bí tích:** Đặc biệt là Bí tích Hòa Giải và Thánh Thể, nguồn mạch của ân sủng.</li>
                </ul>
                <h3>Tái Lực Cho Sứ Vụ</h3>
                <p>Buổi tĩnh tâm không chỉ giúp các Huynh Trưởng được nghỉ ngơi, tái tạo năng lượng mà còn giúp họ nhìn nhận lại mục đích của sứ vụ, đặt Chúa làm trọng tâm trong mọi hoạt động. Việc nuôi dưỡng đời sống nội tâm mạnh mẽ sẽ giúp các Huynh Trưởng vững vàng hơn trong việc hướng dẫn các em Thiếu Nhi đến gần Chúa.</p>
                <p>Kết thúc buổi tĩnh tâm, mọi người cùng nhau dâng lên Chúa những lời nguyện xin và quyết tâm sống Mùa Vọng cách ý nghĩa hơn, trở thành những tấm gương sáng về đời sống đức tin cho các em Thiếu Nhi noi theo.</p>
            `
        }
        // Thêm các bài viết khác vào đây
    ];

    if (articleId) {
        const article = articles.find(art => art.id === articleId);

        if (article) {
            articleTitle.textContent = article.title;
            articleMeta.textContent = `${article.author} | ${article.date}`;
            
            if (article.imageUrl) {
                articleImage.src = article.imageUrl;
                articleImage.style.display = 'block'; // Hiển thị ảnh nếu có
            } else {
                articleImage.style.display = 'none'; // Ẩn ảnh nếu không có
            }
            
            articleContent.innerHTML = article.fullContent;
        } else {
            articleTitle.textContent = 'Không tìm thấy bài viết';
            articleMeta.textContent = '';
            articleImage.style.display = 'none';
            articleContent.innerHTML = '<p class="error-message">Xin lỗi, bài viết bạn tìm không tồn tại.</p>';
        }
    } else {
        articleTitle.textContent = 'Lỗi: Không có ID bài viết';
        articleMeta.textContent = '';
        articleImage.style.display = 'none';
        articleContent.innerHTML = '<p class="error-message">Vui lòng chọn một bài viết từ trang tin tức.</p>';
    }

    // Nút cuộn lên đầu trang (giữ nguyên logic cũ từ main.js hoặc thêm vào đây nếu main.js không được dùng)
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                backToTopBtn.style.display = "block";
            } else {
                backToTopBtn.style.display = "none";
            }
        };

        backToTopBtn.addEventListener('click', () => {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
    }
});

// Logic cho nút "Đăng Bài" (giữ nguyên hoặc chuyển vào main.js nếu là chức năng chung)
document.addEventListener('DOMContentLoaded', () => {
    const addArticleLink = document.getElementById('addArticleLink');
    const logoutButton = document.getElementById('logoutButton');

    // Giả định trạng thái đăng nhập. Trong thực tế sẽ kiểm tra token/session
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; 

    if (isLoggedIn) {
        if (addArticleLink) addArticleLink.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'inline-block';
    } else {
        if (addArticleLink) addArticleLink.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'none';
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            alert('Bạn đã đăng xuất!');
            window.location.reload(); // Tải lại trang để cập nhật trạng thái UI
        });
    }
});