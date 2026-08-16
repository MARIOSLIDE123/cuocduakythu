# 🏇 CUỘC ĐUA KỲ THÚ - WEB APP GAME GIÁO DỤC LỚP HỌC

> Ứng dụng web game đua ngựa giáo dục tương tác chuyên nghiệp dành cho giáo viên trình chiếu trên TV/máy chiếu lớp học (THCS, THPT, Tiểu học).

---

## 🌟 TÍNH NĂNG CHÍNH

1. **Trường Đua Ngựa Sinh Động (Lên đến 50+ Học Sinh)**:
   - Tự động gán mã ngựa (Ngựa 01, Ngựa 02,...) và bảng màu nhận diện cho từng học sinh.
   - Mô phỏng cuộc đua ngựa kịch tính, chân thực với khả năng bứt tốc, đổi ngôi ngoạn mục (5–12 giây).
   - Tự động chuyển đổi chế độ thu gọn (Compact mode) để hiển thị mượt mà ngay cả với lớp đông từ 40–50 học sinh.

2. **Nhập / Xuất Danh Sách Học Sinh & Ngân Hàng Câu Hỏi Bằng Excel (.xlsx, .xls)**:
   - Kéo thả file Excel học sinh và bộ câu hỏi trắc nghiệm trực quan.
   - Cung cấp nút tải file mẫu chuẩn: `danh_sach_hoc_sinh_mau.xlsx` và `ngan_hang_cau_hoi_mau.xlsx`.
   - Xuất kết quả toàn diện của buổi học ra file Excel.

3. **Màn Hình Câu Hỏi & Trả Lời Trắc Nghiệm Thông Minh**:
   - Tự động hiển thị câu hỏi cho chú ngựa về đích đầu tiên.
   - Đồng hồ đếm ngược thời gian suy nghĩ trực quan với âm thanh cảnh báo.
   - 4 ô đáp án A, B, C, D to rõ, hỗ trợ nhấn phím tắt bàn phím (1, 2, 3, 4 hoặc A, B, C, D).
   - Tự động xáo trộn 4 đáp án (shuffle options) chống học sinh đoán mò.

4. **Bảng Xếp Hạng & Lễ Trao Giải Quán Quân (Podium 🥇 🥈 🥉)**:
   - Bục vinh danh Top 3 học sinh xuất sắc nhất với hiệu ứng pháo hoa rực rỡ và nhạc chiến thắng.
   - Bảng thống kê chi tiết điểm số, số lần về đích, số câu đúng/sai và tỷ lệ chính xác.

5. **Bảng Điều Khiển Giáo Viên (Teacher Mode)**:
   - Tạm dừng/tiếp tục cuộc đua, can thiệp chọn ngựa về đích thủ công nếu cần, đổi câu hỏi, cộng thời gian suy nghĩ (+5s), reset điểm hoặc bắt đầu trận mới.

6. **Hệ Thống Âm Thanh Tổng Hợp (Web Audio Synthesizer)**:
   - Tiếng vó ngựa dồn dập, còi xuất phát, tiếng bíp đếm ngược 3-2-1, chuông trả lời đúng, kèn vinh danh chiến thắng.
   - Hoạt động 100% offline trong trình duyệt, không bị phụ thuộc tài nguyên mạng.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev):
```bash
npm run dev
```

### 3. Đóng gói bản Production:
```bash
npm run build
```

### 4. Triển khai lên Vercel:
- Kết nối repository GitHub với Vercel.
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Nhấn **Deploy**!

---

## 📊 CẤU TRÚC FILE EXCEL

### 1. File Excel Học Sinh (`danh_sach_hoc_sinh.xlsx`)
| STT | Họ và tên | Lớp |
|---|---|---|
| 1 | Nguyễn Minh Anh | 9A1 |
| 2 | Trần Quốc Bảo | 9A1 |
| 3 | Lê Hoàng Nam | 9A1 |

### 2. File Excel Câu Hỏi (`ngan_hang_cau_hoi.xlsx`)
| Mã | Câu hỏi | Đáp án A | Đáp án B | Đáp án C | Đáp án D | Đáp án đúng | Giải thích | Điểm | Môn/Chủ đề |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Căn bậc hai số học của 81 là gì? | 9 | -9 | ±9 | 81 | A | Vì 9² = 81 và 9 ≥ 0 | 10 | Toán học 9 |

---

## ⌨️ PHÍM TẮT TIỆN ÍCH

- **Phím A hoặc 1**: Chọn đáp án A
- **Phím B hoặc 2**: Chọn đáp án B
- **Phím C hoặc 3**: Chọn đáp án C
- **Phím D hoặc 4**: Chọn đáp án D
- **F11**: Bật/tắt chế độ toàn màn hình máy chiếu
