# Nhật ký QA — Vết Thủng 2237

## Audit Chương 1 — 11/08/2026

- Đã kiểm tra đủ 12 trang theo thứ tự trong `story-data.js`.
- Đã đối chiếu thoại trong ảnh với `chapters/chuong-01.md`.
- Đã kiểm tra bảng màu, thiết bị cổ tay phải của An Vy và tạo hình Kha-Ruun.
- Đã thay trang 4 vì bản cũ thể hiện Kha-Ruun thành khối đá khổng lồ, trái hồ sơ nhân vật.
- Trang 4 mới giữ Kha-Ruun ở tỷ lệ người cao, gầy khỏe, da bazan, mắt hổ phách, vân xanh lục và giáp vai lưỡi liềm bên phải.
- Đã kiểm tra lại lettering trang 4, không còn chữ bị cắt hoặc tràn hộp thoại.

## Audit reader di động — 11/08/2026

- Đã bỏ thanh tiêu đề nổi phía trên vì che phần đầu trang truyện trên điện thoại, đặc biệt ở trang 1–3.
- Đã đưa nút thoát vào dock dưới cùng với nút lật trang và số trang luôn hiển thị.
- Đã ưu tiên tải trang đang đọc cùng hai trang kề, thay vì luôn tải gấp trang 1–2.
- Đã preload cả trang trước và trang sau để lật hai chiều mượt hơn.
- Đã bổ sung nhãn trang cho trình đọc màn hình và phím `Home`/`End` để về đầu/cuối chương.

## Audit phát hành và kết chương — 11/08/2026

- Đã đối chiếu lại ảnh bìa với thiết kế khóa của An Vy, Kha-Ruun và bảng màu của truyện.
- Đã tạo ảnh chia sẻ riêng tỷ lệ 1200 × 630 từ bìa gốc; không vẽ lại hoặc thay đổi thiết kế nhân vật.
- Đã bổ sung canonical URL, Open Graph, Twitter Card, kích thước và mô tả thay thế cho ảnh chia sẻ.
- Ảnh Open Graph dùng URL tuyệt đối để trình thu thập mạng xã hội tải đúng trên GitHub Pages.
- Ở trang 12, nút tiến đổi thành nút hoàn tất chương; khi xác nhận, reader đóng, tiến độ về trang 1 và nút chính đổi thành “Đọc lại chương”.

## Audit thoại tự nhiên — 11/08/2026

- Đã thay mới trang 1 và trang 2 bằng ảnh truyện được tạo hoàn chỉnh cùng bong bóng thoại tiếng Việt; không ghép hộp thoại dạng giao diện lên tranh.
- Đã viết lại lời An Vy, Chỉ huy Bách và Trung tâm theo câu nói ngắn, có phản ứng trực tiếp trong tình huống khẩn cấp.
- Đã chuyển tín hiệu ba nhịp thành âm thanh “Cộc. Cộc. Cộc.” để người đọc cảm nhận thay vì nghe nhân vật giải thích.
- Đã bỏ nhãn tên người nói khỏi bong bóng; đuôi thoại và ngữ cảnh khung tranh xác định người đang nói.
- Đã đối chiếu chính tả, dấu tiếng Việt, thứ tự sự kiện, màu trang phục và thiết bị cứu hộ cyan của An Vy.

## Trạng thái

- Chương 1 hoàn tất: 12/12 trang.
- Lượt audit tiếp theo tiếp tục làm mềm thoại và thay trang 3–4 theo chuẩn bong bóng thoại mới.
