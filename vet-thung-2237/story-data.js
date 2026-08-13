const STORY = {
  title: 'Vết Thủng 2237',
  publishedThrough: 20,
  publicationComplete: false,
  chapters: [
    {number: 1, title: 'Ba Nhịp Dưới Hố Sâu', startPage: 1, endPage: 12, complete: true},
    {number: 2, title: 'Tín Hiệu Thứ Chín', startPage: 13, endPage: 20, complete: false}
  ],
  pages: [
    {number: 1, image: 'assets/pages/page-01.webp?v=dialogue-20260811', title: 'Thứ rơi ngoài bản đồ sao', alt: 'Thiên thể Mắt Rơi xuyên qua thành phố năm 2237 và An Vy gọi Trung tâm'},
    {number: 2, image: 'assets/pages/page-02.webp?v=dialogue-20260811', title: 'Ba nhịp', alt: 'An Vy bất chấp lệnh dừng và nghe ba nhịp từ dưới hố sâu'},
    {number: 3, image: 'assets/pages/page-03.webp?v=dialogue-20260811-p34', title: 'Kẻ Trên Mặt', alt: 'An Vy chạm trán Kha-Ruun ở độ sâu 91 ki-lô-mét'},
    {number: 4, image: 'assets/pages/page-04.webp?v=dialogue-20260811-p34', title: 'Bầu trời thứ hai', alt: 'Kha-Ruun cứu An Vy trước khi Nham Cung hiện ra'},
    {number: 5, image: 'assets/pages/page-05.webp?v=dialogue-20260811-p56', title: 'Nham Cung báo động', alt: 'Kha-Ruun đứng ra bảo chứng cho An Vy trước Hội Đồng Nham'},
    {number: 6, image: 'assets/pages/page-06.webp?v=dialogue-20260811-p56', title: 'Lệnh xuyên vỏ', alt: 'Chỉ huy Bách chuẩn bị đầu đạn xuyên vỏ sau khi mất tín hiệu An Vy'},
    {number: 7, image: 'assets/pages/page-07.webp?v=dialogue-20260811-p78', title: 'Ký ức trong đá', alt: 'An Vy và Kha-Ruun thấy ký ức tổ tiên tộc Nham phóng Mắt Rơi khỏi Trái Đất'},
    {number: 8, image: 'assets/pages/page-08.webp?v=dialogue-20260811-p78', title: 'Hai phía khai hỏa', alt: 'An Vy và Kha-Ruun phát hiện đầu đạn bề mặt cùng pháo địa nhiệt bị mệnh lệnh giả điều khiển'},
    {number: 9, image: 'assets/pages/page-09.webp?v=dialogue-20260811-p910', title: 'Mắt mở', alt: 'An Vy và Kha-Ruun thấy Mắt Rơi hút hai luồng nhiệt rồi mở thành một mống mắt cơ khí'},
    {number: 10, image: 'assets/pages/page-10.webp?v=dialogue-20260811-p910', title: 'Khóa đôi', alt: 'Thiết bị cổ tay An Vy và vân Nham của Kha-Ruun cùng kích hoạt hai nửa khóa'},
    {number: 11, image: 'assets/pages/page-11.webp?v=dialogue-20260811-p1112', title: 'Một giây ngừng bắn', alt: 'An Vy phát bằng chứng gốc để Bách và Hội Đồng Nham cùng ra lệnh ngừng bắn'},
    {number: 12, image: 'assets/pages/page-12.webp?v=dialogue-20260811-p1112', title: 'Những vết thủng khác', alt: 'An Vy và Kha-Ruun nhìn bản đồ Trái Đất hiện đúng chín tín hiệu Vết Thủng'},
    {number: 13, image: 'assets/pages/page-13.webp?v=chapter-02-20260813-p1', title: 'Chín tín hiệu', alt: 'An Vy và Kha-Ruun phát hiện tín hiệu Vết Thủng thứ chín đang di chuyển dưới Thái Bình Dương'},
    {number: 14, image: 'assets/pages/page-14.webp?v=chapter-02-20260813-p2', title: 'Ra đón nó', alt: 'An Vy và Kha-Ruun đi xuống con đường cổ dưới Nham Cung để chặn tín hiệu 09'},
    {number: 15, image: 'assets/pages/page-15.webp?v=chapter-02-20260813-p34', title: 'Đường khóa thức giấc', alt: 'An Vy và Kha-Ruun phát hiện cảnh báo cổ viết cho cả người bề mặt lẫn tộc Nham'},
    {number: 16, image: 'assets/pages/page-16.webp?v=chapter-02-20260813-p34', title: 'Người không có trong ký ức', alt: 'Bản ghi cổ cho thấy người bề mặt từng cùng tổ tiên tộc Nham phóng Mắt Rơi'},
    {number: 17, image: 'assets/pages/page-17.webp?v=chapter-02-20260813-p56', title: 'Nhịp giả thứ hai', alt: 'Chỉ huy Bách phát hiện tín hiệu giả mang sinh trắc hoàn hảo của An Vy và khóa lệnh khai hỏa'},
    {number: 18, image: 'assets/pages/page-18.webp?v=chapter-02-20260813-p56', title: 'Trạm giữa biển', alt: 'An Vy và Kha-Ruun đến nhà ga cổ dưới Thái Bình Dương nơi tín hiệu 09 dừng sau cửa khóa đôi'},
    {number: 19, image: 'assets/pages/page-19.webp?v=chapter-02-20260813-p78', title: 'Kẻ mang tin', alt: 'An Vy và Kha-Ruun mở khóa đôi, tìm thấy khoang chuyển tin bị hư hại cảnh báo tám điểm còn lại sắp thức'},
    {number: 20, image: 'assets/pages/page-20.webp?v=chapter-02-20260813-p78', title: 'Lịch sử bị cắt đôi', alt: 'Bản ghi cổ cho thấy người bề mặt và tộc Nham từng cùng xây mạng khóa rồi chia đôi ký ức về cuộc phản bội'}
  ]
};
