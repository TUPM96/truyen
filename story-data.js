// Final comic pages include their own professionally composed Vietnamese
// lettering. Keeping the script below separate makes later corrections and
// accessibility checks possible without drawing a second HTML layer on top.
const pageImage = number => `cuu-tang-phang/assets/pages/page-${String(number).padStart(2, '0')}-lettered.webp`;

const STORY = {
  title: 'Cửu Tầng Phẳng',
  volume: 'Tập 1 — Người giữ khóa',
  // Production data stays here so later illustration runs can continue the
  // complete volume. The public reader only exposes finished page images.
  publishedThrough: 38,
  chapters: [
    {
      short: 'Mép trời',
      title: 'Mép Trời Không Cong',
      opening: 'Ở Tầng Một, trẻ con học ba điều trước khi học tên mình: trời ở trên, đất ở dưới, và thế giới không có mép.',
      pages: [
        {global:1, image:pageImage(1), title:'Đường thẳng', alt:'Linh An đo đường chân trời ở Khe Gió', narration:'Thành Khe Gió nằm trên đồng muối phẳng tới mức một tiếng chuông có thể chạy xa hơn người gõ nó.', lines:[['Linh An','Nếu không có mép, tại sao mọi bản đồ đều dừng ở cùng một chỗ?'],['Mốc','Sai số: không.'],['Linh An','Vậy người sai không phải cái thước.']]},
        {global:2, image:pageImage(2), title:'Cái bóng dựng đứng', alt:'Chiếc bóng bất thường giữa chợ Khe Gió', narration:'Giữa trưa, khi Nhật Tuyến nằm đúng thiên đỉnh, mọi cái bóng co lại dưới chân. Trừ bóng của Linh An.', lines:[['Người bán muối','Đừng nhìn nó!'],['Linh An','Mốc, kim la bàn đang chỉ đi đâu?'],['Mốc','Không phải hướng. Là độ sâu.']]},
        {global:3, image:pageImage(3), title:'Chín đường', alt:'Tấm bản đồ đồng có chín đường song song', narration:'Thầy Vân khóa bảy lớp cửa kho bản đồ và đặt lên bàn một tấm đồng chưa từng có trong bất kỳ thư mục nào.', lines:[['Linh An','Đây không phải bản đồ.'],['Thầy Vân','Đúng. Nó là mặt cắt.'],['Thầy Vân','Con có ba phút để chọn thế giới mình muốn tin.']]},
        {global:4, image:pageImage(4), title:'Chuyến tàu cuối', alt:'Tàu cáp vượt đồng muối tới tường mây', narration:'Chuyến tàu cuối không đi đến một thành phố. Nó đi đến nơi người ta dùng thời tiết để giấu một cánh cửa.', lines:[['Linh An','Bốn trăm cây số mà tháp gió vẫn chưa khuất.'],['Mốc','Bản đồ trường học nói dối.'],['Linh An','Hôm nay mình cũng vậy. Nói dối rằng mình không sợ.']]},
        {global:5, image:pageImage(5), title:'Kim chỉ xuống', alt:'Vết nứt xanh dưới đường ray', narration:'Đường ray kết thúc ở một vết nứt xanh. Bên dưới lớp muối, một nhịp rung đều như trái tim của cỗ máy khổng lồ.', lines:[['Linh An','Mình đang đứng trên thứ gì?'],['Mốc','Không phải “trên”.'],['Mốc','Chúng ta đang đứng ở ngoài cùng.']]},
        {global:6, image:pageImage(6), title:'Bầu trời thứ hai', alt:'Một bầu trời khác hiện dưới khe nứt', narration:'Những đốm sáng dưới khe nứt không chuyển động cùng các vì sao phía trên. Chúng là cửa sổ của một thành phố khác.', lines:[['Hạ Miên','An, nếu con nghe được, đừng tìm đường ra ngoài.'],['Linh An','Mẹ?'],['Hạ Miên','Hãy tìm đường xuống.']]},
        {global:7, image:pageImage(7), title:'Người giữ chân trời', alt:'Đội Bạch Kinh truy đuổi trên xe buồm', narration:'Buồm trắng xé qua đồng muối. Người đứng ở mũi xe đeo mặt nạ men trắng có một đường đen dọc giữa mặt.', lines:[['Bạch Kinh','Giao chìa khóa. Ta sẽ để cô quên.'],['Linh An','Ông nói như thể quên là một đặc ân.'],['Bạch Kinh','Mẹ cô cũng từng trả lời như vậy.']]},
        {global:8, image:pageImage(8), title:'Đền không đáy', alt:'Đền gió mở lối xuống Đường Khâu', narration:'Chiếc la bàn khớp vào bệ thờ. Nền đá tách thành sáu cánh, để lộ một giếng vuông sâu đến mức ánh sáng rơi vào cũng không vọng lại.', lines:[['Mốc','Đường Khâu Một mất đồng bộ.'],['Linh An','Nói bằng thứ tiếng khiến mình bớt sợ đi.'],['Mốc','Thang có thể rơi.']]},
        {global:9, image:pageImage(9), title:'Khi dưới đổi hướng', alt:'Trọng lực xoay trong Đường Khâu', narration:'Giữa hai tầng, trọng lực đổi ý. Vách thành sàn, sàn thành trần, và chữ “rơi” không còn chỉ một hướng.', lines:[['Linh An','Tầng dưới ở đâu?'],['Mốc','Câu hỏi cũ không còn hợp lệ.'],['Linh An','Vậy cho mình một câu hỏi mới.']]},
        {global:10, image:pageImage(10), title:'Hải Trần', alt:'Đại dương nằm trên trần Tầng Hai', narration:'Cửa thang mở ra một thế giới nơi đại dương trải trên trần trời. Cá voi bơi phía trên những tòa tháp treo bằng xích.', lines:[['Linh An','Nước ở trên trời…'],['Mốc','Với họ, chúng ta mới ở trên trời.'],['Giọng lạ','Đứng yên nếu cô không muốn bị biển kéo ngược lên!']]},
        {global:11, image:pageImage(11), title:'Tin nhắn của mẹ', alt:'Hình chiếu Hạ Miên trong trạm bảo trì', narration:'Trong trạm bảo trì, chiếc la bàn dựng lên bóng Hạ Miên già hơn ký ức của Linh An mười hai năm.', lines:[['Hạ Miên','Cọc Neo thứ nhất sắp gãy.'],['Linh An','Mẹ đang ở đâu?'],['Hạ Miên','Ở nơi đã rút chiếc cọc đầu tiên.']]},
        {global:12, image:pageImage(12), title:'Chìa khóa sống', alt:'La bàn mở thành chín vòng sáng', narration:'Chín vòng sáng bung khỏi la bàn và quấn quanh cánh tay Linh An. Vết sẹo trong lòng bàn tay cô đáp lại nhịp rung của Cọc Neo.', lines:[['Mốc','Xác nhận người giữ khóa.'],['Linh An','Mẹ để lại chìa khóa cho mình?'],['Bạch Kinh','Không. Mẹ cô để lại cô làm chìa khóa.']]}
      ]
    },
    {
      short: 'Biển trên trời',
      title: 'Thành Phố Dưới Biển Trần',
      opening: 'Ở Hải Trần, người ta không sợ chết đuối dưới sông. Họ sợ một ngày đại dương trên đầu quên mất đường về.',
      pages: [
        {global:13, image:pageImage(13), title:'Người bắt giọt', alt:'Nghi kéo Linh khỏi cột nước ngược', narration:'Một sợi dây móc lấy thắt lưng Linh ngay khi lực hút từ biển trần nhấc bổng cô khỏi mặt đất.', lines:[['Nghi','Muốn ngắm biển thì dùng mắt, đừng đưa cả người lên.'],['Linh An','Tôi đi từ Tầng Một xuống.'],['Nghi','Vậy cô rơi nhầm xa thật.']]},
        {global:14, image:pageImage(14), title:'Sao Chìm', alt:'Thành phố treo dưới đại dương', narration:'Thành Sao Chìm treo dưới biển bằng hàng nghìn sợi xích. Mỗi ngôi nhà có một máng hứng những giọt nước đi lạc khỏi trần.', lines:[['Nghi','Tên tôi là Nghi. Tôi vá xích và bắt giọt.'],['Linh An','Tôi cần đến Cọc Neo.'],['Nghi','Ai cũng cần. Không ai được đến.']]},
        {global:15, image:pageImage(15), title:'Nhịp nước sai', alt:'Cá voi va vào mặt biển trần', narration:'Một con cá voi khổng lồ đập vào mặt dưới của đại dương. Sóng không lan ngang; nó lún xuống như một mái nhà sắp sập.', lines:[['Mốc','Chu kỳ nước lệch bốn phẩy tám giây.'],['Nghi','Hôm qua là ba giây.'],['Linh An','Cọc Neo không chỉ giữ hai tầng. Nó giữ cả biển.']]},
        {global:16, image:pageImage(16), title:'Bản án của kẻ lạ', alt:'Hội đồng Sao Chìm xét hỏi Linh An', narration:'Hội đồng Sao Chìm không tin người từ Tầng Một. Họ càng không tin một chiếc la bàn gọi cô là người giữ khóa.', lines:[['Trưởng hội đồng','Tầng trên lấy ánh sáng và đổ nóng xuống chúng tôi.'],['Linh An','Tôi không đến để biện hộ cho họ.'],['Nghi','Cô ấy đến vì nếu cọc gãy, chẳng còn “họ” hay “chúng ta”.']]},
        {global:17, image:pageImage(17), title:'Mặt nạ trong mưa', alt:'Bạch Kinh xuất hiện trong mưa ngược', narration:'Mưa bắt đầu rơi lên. Giữa những giọt nước bay ngược, Bạch Kinh bước vào quảng trường và tháo mặt nạ.', lines:[['Bạch Kinh','Tên thật của ta là Bạch Miên.'],['Linh An','Ông mang họ của mẹ tôi.'],['Bạch Kinh','Vì Hạ Miên là chị ta.']]},
        {global:18, image:pageImage(18), title:'Lời đề nghị', alt:'Bạch Kinh đưa nửa chìa khóa', narration:'Bạch Miên đặt nửa bánh răng đen lên bàn. Nó vừa khít với vòng ngoài chiếc la bàn của Linh.', lines:[['Bạch Miên','Ta đã đuổi cô để Bạch Kinh tin ta vẫn trung thành.'],['Linh An','Một lời nói dối rất tiện.'],['Bạch Miên','Sống sót thường không đẹp như sự thật.']]},
        {global:19, image:pageImage(19), title:'Đêm nước rơi', alt:'Biển trần sụp thành cột nước', narration:'Còi báo động rít lên. Một mảng biển tách khỏi trần, đổ xuống thành cột nước nuốt trọn khu dân cư thấp.', lines:[['Nghi','Xích số bảy đứt rồi!'],['Linh An','Đưa mọi người về ga Đường Khâu.'],['Bạch Miên','Còn cô?'],['Linh An','Tìm cái đang kéo biển xuống.']]},
        {global:20, image:pageImage(20), title:'Dấu tay trên cọc', alt:'Dấu tay Hạ Miên trên Cọc Neo', narration:'Sau lớp vỏ bảo trì, Linh tìm thấy một dấu tay cháy sạm mang cùng vân sáng với lòng bàn tay mình.', lines:[['Mốc','Dấu sinh trắc: Hạ Miên.'],['Linh An','Mẹ đã tới đây.'],['Bạch Miên','Và chị ấy cố khóa cọc từ phía bên kia.']]}
      ]
    },
    {
      short: 'Hai phía trọng lực',
      title: 'Thành Phố Lộn Ngược',
      opening: 'Muốn tới lõi Cọc Neo, họ phải đi qua mặt dưới của Hải Trần — nơi kẻ ở phía bên kia luôn tin chính mình mới đứng đúng.',
      pages: [
        {global:21, image:pageImage(21), title:'Cầu xoay', alt:'Đoàn người bước qua vùng xoay trọng lực', narration:'Cây cầu không bắc qua vực. Nó bắc qua một hướng khác của trọng lực.', lines:[['Nghi','Bước đến vạch đồng rồi thả lỏng đầu gối.'],['Linh An','Nếu tôi không thả?'],['Nghi','Cô sẽ gãy theo hai hướng cùng lúc.']]},
        {global:22, image:pageImage(22), title:'Mặt dưới', alt:'Thành phố ở mặt dưới của Tầng Hai', narration:'Qua nửa vòng xoay, Sao Chìm xuất hiện lần nữa ở phía đối diện. Một thành phố khác sống lộn ngược ngay dưới chân thành phố cũ.', lines:[['Linh An','Hai thành phố dùng chung một mặt đất.'],['Bạch Miên','Và đã đánh nhau vì cùng gọi phía kia là dưới.'],['Mốc','Dữ kiện lịch sử bị xóa: tám mươi bảy phần trăm.']]},
        {global:23, image:pageImage(23), title:'Chợ Gương', alt:'Hai phía giao dịch qua kính trọng lực', narration:'Ở Chợ Gương, hàng hóa được chuyền qua những ô cửa nơi vật thể rơi sang phía đối diện. Người mua và kẻ bán không bao giờ đứng cùng một hướng.', lines:[['Nghi','Đừng nhìn quá lâu. Não sẽ chọn nhầm sàn.'],['Linh An','Mẹ từng mua thứ gì ở đây?'],['Người giữ chợ','Một con đường tới Tầng Chín.']]},
        {global:24, image:pageImage(24), title:'Khóa thứ hai của Mốc', alt:'Mốc mở bộ nhớ Hạ Miên', narration:'Ký hiệu trên quầy chạm vào mắt Mốc. Lớp vỏ tam giác mở ra, giải phóng một mảnh ký ức bị niêm phong.', lines:[['Hạ Miên trong ký ức','An sẽ không tha thứ cho chúng ta.'],['Bạch Miên trẻ','Miễn con bé còn sống.'],['Linh An','Hai người đã làm gì với tôi?']]},
        {global:25, image:pageImage(25), title:'Đứa trẻ của Cọc Neo', alt:'Linh An lúc nhỏ trong buồng máy', narration:'Ký ức cho thấy Linh An khi còn bé nằm trong buồng điều khiển. Chín vòng sáng được cấy vào nhịp tim cô.', lines:[['Bạch Miên','Người kiến tạo không để lại chìa khóa bằng kim loại.'],['Linh An','Nên mẹ biến tôi thành một cái khóa?'],['Bạch Miên','Chị ấy biến cô thành người có thể từ chối mở nó.']]},
        {global:26, image:pageImage(26), title:'Cuộc phục kích trắng', alt:'Bạch Kinh tấn công Chợ Gương', narration:'Những mặt nạ trắng tràn xuống cả hai phía của chợ. Đội Bạch Kinh thật sự đã theo dấu chiếc la bàn.', lines:[['Chấp tuyến Hàm','Bạch Miên, ông bị tước quyền chỉ huy.'],['Bạch Miên','Ta tự tước từ lúc các người chọn cứu bí mật thay vì cứu thế giới.'],['Linh An','Nghi, tắt đèn chợ!']]},
        {global:27, image:pageImage(27), title:'Rơi về hai phía', alt:'Cuộc chiến trong vùng trọng lực kép', narration:'Đèn tắt. Trong vùng trọng lực kép, người và vũ khí rơi về hai bầu trời khác nhau. Mốc chỉ đường bằng một vệt sáng cyan.', lines:[['Mốc','Ba bước trái. Nhảy. Tin tôi.'],['Linh An','Đó là câu đáng sợ nhất cậu từng nói.'],['Mốc','Cập nhật: thang có thể rơi vẫn đáng sợ hơn.']]},
        {global:28, image:pageImage(28), title:'Cửa vào lõi', alt:'Cánh cửa Cọc Neo mở bằng bàn tay Linh', narration:'Linh đặt tay lên cửa lõi. Chín vòng sáng quay ngược nhau, và cánh cửa mở như một con mắt đen.', lines:[['Cọc Neo','NGƯỜI GIỮ KHÓA THỨ CHÍN ĐÃ TRỞ LẠI.'],['Linh An','Tôi chưa từng ở đây.'],['Mốc','Nhưng một phần của cô chưa từng rời đi.']]}
      ]
    },
    {
      short: 'Cỗ máy chín tầng',
      title: 'Trái Tim Của Cọc Neo',
      opening: 'Bên trong cọc không có bánh răng. Có một bầu trời đen và những sợi sáng dài hơn mọi con đường Linh từng đo.',
      pages: [
        {global:29, image:pageImage(29), title:'Bên trong khoảng cách', alt:'Không gian vô tận trong Cọc Neo', narration:'Cọc Neo lớn hơn lớp vỏ của nó. Bên trong là khoảng không được gấp lại, nơi chín tầng hiện thành chín dải sáng song song.', lines:[['Nghi','Chúng ta vừa bước vào đâu?'],['Bạch Miên','Khoảng cách giữa các thế giới.'],['Linh An','Không. Khoảng cách đang nằm bên trong thứ giữ nó.']]},
        {global:30, image:pageImage(30), title:'Chín nhịp tim', alt:'Chín tầng đập như nhịp tim', narration:'Mỗi tầng phát một nhịp khác nhau. Tầng Một quá nhanh. Hải Trần hụt nhịp. Tầng Chín gần như im lặng.', lines:[['Mốc','Độ lệch pha vượt giới hạn.'],['Linh An','Có thể đồng bộ lại không?'],['Mốc','Cần đủ chín khóa. Chúng ta có một.']]},
        {global:31, image:pageImage(31), title:'Lựa chọn của Hội Đồng', alt:'Tín hiệu yêu cầu cắt Tầng Hai', narration:'Hội Bạch Kinh truyền lệnh cuối: cắt Hải Trần khỏi hệ thống để cứu tám tầng còn lại.', lines:[['Chấp tuyến Hàm','Mười hai triệu người đổi lấy toàn Cửu Diệp.'],['Nghi','Ông nói con số vì không dám nói tên.'],['Linh An','Không cắt tầng nào cả.']]},
        {global:32, image:pageImage(32), title:'Con đường của Hạ Miên', alt:'Bản ghi Hạ Miên đi sâu vào hệ thống', narration:'Mốc mở mảnh ký ức thứ ba. Hạ Miên đã dùng chính mình làm cầu truyền pha tới Tầng Chín.', lines:[['Hạ Miên','Nếu An tới đây, hãy để con bé được chọn.'],['Bạch Miên','Nếu lựa chọn của nó giết tất cả thì sao?'],['Hạ Miên','Vậy ít nhất đó là lựa chọn của một con người, không phải mệnh lệnh của máy.']]},
        {global:33, image:pageImage(33), title:'Cầu bằng ký ức', alt:'Linh nối vào các tầng qua ký ức', narration:'Linh cắm la bàn vào lõi. Những ký ức không thuộc về cô tràn vào: biển trần, rừng biết hát, thành phố đứng im giữa một giây.', lines:[['Linh An','Tôi nghe thấy tất cả họ.'],['Mốc','Đừng mở toàn bộ khóa. Cô sẽ mất ranh giới bản thân.'],['Linh An','Vậy nhắc tôi tên mình.']]},
        {global:34, image:pageImage(34), title:'Tên của cô', alt:'Mốc và Nghi giữ Linh tỉnh táo', narration:'Mỗi khi một tầng kéo Linh khỏi chính mình, Mốc đọc tên cô. Nghi kể những điều nhỏ nhặt chỉ người sống mới nhớ.', lines:[['Mốc','Linh An. Mười chín tuổi. Ghét trà quá ngọt.'],['Nghi','Cô còn nợ tôi một sợi dây cứu mạng.'],['Linh An','Tốt. Tôi vẫn còn nợ, nghĩa là tôi vẫn còn đây.']]},
        {global:35, image:pageImage(35), title:'Kẻ cắt dây', alt:'Chấp tuyến Hàm xâm nhập lõi', narration:'Hàm xuất hiện ở lối vào với thiết bị cắt tầng. Sau lưng ông, biển trần đã võng xuống như sắp chạm đất.', lines:[['Hàm','Cô không đủ chín khóa. Hy vọng không phải phương án.'],['Bạch Miên','Sợ hãi cũng không.'],['Hàm','Sợ hãi giữ loài người sống sót.']]},
        {global:36, image:pageImage(36), title:'Một khóa, chín người', alt:'Dân chúng cùng chia tín hiệu khóa', narration:'Linh không cố trở thành chín chìa khóa. Cô mở đường truyền và để người ở mỗi tầng tự gửi nhịp của họ vào lõi.', lines:[['Linh An','Máy đang chờ một người ra lệnh.'],['Nghi','Và cô sẽ làm gì?'],['Linh An','Cho nó nghe chín thế giới trả lời.']]}
      ]
    },
    {
      short: 'Ngày hai trời chạm',
      title: 'Ngày Hai Bầu Trời Chạm Nhau',
      opening: 'Khoảng cách giữa Tầng Một và Hải Trần còn lại chưa đầy một thành phố. Lần đầu tiên, dân hai tầng có thể nhìn thấy nhau bằng mắt thường.',
      pages: [
        {global:37, image:pageImage(37), title:'Mặt đất trên đầu', alt:'Tầng Một hiện trên bầu trời Hải Trần', narration:'Đồng muối của Tầng Một hiện rõ phía trên biển trần. Những tháp gió treo như răng của một cỗ máy đang khép miệng.', lines:[['Nghi','Nếu hai tầng chạm nhau?'],['Mốc','Không còn đủ từ để mô tả hậu quả.'],['Linh An','Vậy đừng để nó xảy ra.']]},
        {global:38, image:pageImage(38), title:'Khe Gió nhìn xuống', alt:'Người Tầng Một nhìn thấy Hải Trần', narration:'Ở Khe Gió, tường mây tan lần đầu sau ba trăm năm. Người dân nhìn thấy đại dương nằm dưới thế giới mình.', lines:[['Thầy Vân qua máy truyền','An, cả thành phố đang hỏi ta đã giấu họ điều gì.'],['Linh An','Thầy nói thật đi.'],['Thầy Vân','Thầy sợ họ sẽ không tha thứ.'],['Linh An','Họ không cần tha thứ ngay. Họ cần biết mình đang cứu ai.']]}
      ]
    }
  ]
};
