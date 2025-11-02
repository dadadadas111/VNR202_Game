# Acrostic Puzzle Game - Dành cho Trình Chiếu 🎬

Một trò chơi acrostic (ô chữ ngang-dọc) được thiết kế dành riêng cho **trình chiếu trong lớp học hoặc hội thảo**, hỗ trợ hiển thị câu hỏi, đáp án, và thống kê dọc interactively.

## Tính Năng ✨

- **Giao diện Acrostic cổ điển**: Lưới ô chữ ngang-dọc với cột acrostic được highlight bằng màu hồng đặc trưng
- **Ẩn câu hỏi mặc định**: Câu hỏi chỉ hiển thị khi người dẫn dắt chọn
- **Hiển thị đáp án có hoạt động**: Khi bấm "Hiện kết quả câu", chữ được điền vào từng ô với hoạt động staggered
- **Popup thông báo**: Sau khi đáp án hiển thị, popup sẽ thông báo câu trả lời chính xác với thiết kế nổi bật
- **Chữ dọc bí ẩn**: Nút riêng để hiển thị toàn bộ cột acrostic nối tiếp với animation
- **Theme lịch sử Đảng**: Màu sắc deep red, fonts serif, phù hợp với nội dung lịch sử
- **Tối ưu trình chiếu**: Font chữ lớn, độ tương phản cao, outline nổi bật cho dòng được chọn
- **JSON-driven**: Hỗ trợ tải puzzle từ file JSON để dễ dàng tạo/sửa câu hỏi

## Cài Đặt 🛠️

### Yêu Cầu
- Python 3.6+ (để chạy local server)
- Trình duyệt hiện đại (Chrome, Firefox, Edge, Safari)

### Bước 1: Clone hoặc Tải Xuống
```bash
git clone https://github.com/dadadadas111/VNR202_Game.git
cd VNR202_Game
```

### Bước 2: Chạy Local Server
Vì trình duyệt có hạn chế với `file://`, bạn cần chạy một static server:

**Windows PowerShell:**
```powershell
python -m http.server 8000
```

**MacOS/Linux Terminal:**
```bash
python3 -m http.server 8000
```

### Bước 3: Mở Trình Duyệt
- Truy cập: `http://localhost:8000`
- Nếu muốn trình chiếu, bấm F11 để fullscreen

## Cách Sử Dụng 📖

### Để Người Dẫn (Host)
1. **Chọn câu hỏi**: Nhấp vào số câu ở cột bên trái hoặc danh sách câu hỏi
   - Câu hỏi sẽ hiển thị trong banner lớn ở đầu trang
   - Các ô tương ứng sẽ được highlight bằng outline đỏ đậm
2. **Hiện đáp án từng câu**: Bấm nút "Hiện kết quả câu"
   - Chữ sẽ điền vào ô ngang với hoạt động
   - Popup sẽ thông báo đáp án chính xác
3. **Hiện chữ dọc bí ẩn**: Bấm nút "Hiện chữ dọc"
   - Toàn bộ cột acrostic sẽ animate
   - Popup thông báo kết quả cuối cùng
4. **Reset**: Nhấp "Reset" để xoá tất cả và bắt đầu lại

### Tệp Puzzle JSON
Câu hỏi và đáp án được lưu trong `puzzles/puzzle1.json`. Cấu trúc:

```json
{
  "gridRows": 7,
  "gridCols": 18,
  "acroCol": 6,
  "answer-label": "Đổi mới",
  "blocks": [[0,0],[0,1],[0,2],...],
  "entries": [
    {
      "n": 1,
      "row": 0,
      "col": 6,
      "len": 8,
      "clue": "Câu hỏi ở đây?",
      "answer": "DAIHOIIV",
      "label": "Đại hội IV"
    },
    ...
  ]
}
```

**Giải Thích Các Trường:**
- `gridRows` / `gridCols`: Kích thước lưới
- `acroCol`: Cột chứa chữ dọc (0-based)
- `answer-label`: Kết quả cuối cùng khi hiển thị chữ dọc (ví dụ: "Đổi mới")
- `blocks`: Danh sách [hàng, cột] của các ô đen (không nhập được)
- `entries`: Danh sách câu hỏi, mỗi entry có:
  - `n`: Số câu
  - `row` / `col`: Vị trí bắt đầu (0-based)
  - `len`: Độ dài (số ô)
  - `clue`: Nội dung câu hỏi
  - `answer`: Đáp án (viết in hoa, không dấu)
  - `label`: Tên/mô tả câu trả lời hiển thị trong popup

## Cấu Trúc Dự Án 📁

```
VNR202_Game/
├── index.html           # Trang chính
├── css/
│   └── styles.css       # Kiểu dáng (theme lịch sử)
├── js/
│   └── app.js           # Logic trò chơi
├── puzzles/
│   └── puzzle1.json     # Câu hỏi & đáp án
├── README.md            # Tài liệu này
└── .gitignore           # Git config
```

## Tính Năng Nâng Cao 🚀

### Tạo Puzzle Mới
1. Sửa `puzzles/puzzle1.json`:
   - Thêm entries mới vào mảng `entries`
   - Cập nhật `gridRows` / `gridCols` nếu cần
   - Điều chỉnh `blocks` cho các ô đen
2. Reload trang → Puzzle mới sẽ load tự động

### Kiểm Soát Từ Xa (Tương Lai)
Có thể mở rộng để hỗ trợ:
- Điều khiển bằng điều khiển từ xa (Bluetooth/USB)
- Đồng bộ múi giờ cho các máy chủ
- Ghi lại kết quả để phân tích sau

## Kiểu Lưới JSON Lấy Ví Dụ 📋

```
Lưới 7 hàng × 18 cột:

  ■ ■ ■ D A I H O I I V       (Entry 1: DAIHOIIV - Đại hội IV)
  ■ ■ N O N G N G H I E P     (Entry 2: NONGNGHIEP - Nông nghiệp)
  ■ P H I A B A C             (Entry 3: PHIABAC - Phía Bắc)
S A N P H A M                  (Entry 4: SANPHAM - Sản phẩm)
  T R U O N G C H I N H       (Entry 5: TRUONGCHINH - Trường Chinh)
  K I N H T E                 (Entry 6: KINHTE - Kinh tế)

Cột acrostic (acroCol = 6):
D (từ DAIHOIIV)
O (từ NONGNGHIEP)
I (từ PHIABAC)
M (từ SANPHAM)
O (từ TRUONGCHINH)
I (từ KINHTE)

→ Đáp án dọc: "DOIMOI" (Đổi mới)
```

## Hỗ Trợ & Xử Sự Cố 🔧

| Vấn Đề | Giải Pháp |
|--------|----------|
| Popup không hiển thị | Kiểm tra console (F12) có lỗi JavaScript không |
| JSON không load | Đảm bảo chạy server (`python -m http.server 8000`), không dùng `file://` |
| Chữ hiển thị không đúng cách | Kiểm tra `answer` và `label` trong `puzzle1.json` |
| Lưới quá nhỏ/lớn | Điều chỉnh kích thước font trong `css/styles.css` (`--font-size`) |

## Ghi Chú Thiết Kế 🎨

- **Theme**: Deep red (`#a71d2a`), cream background (`#fff8f2`), gold accents
- **Font**: Merriweather (serif) cho tiêu đề, Noto Sans cho nội dung
- **Tương phản**: Tối ưu cho trình chiếu (kích thước lớn, outline nổi bật)
- **Animation**: Staggered reveal cho cảm giác chuyên nghiệp

## Giấy Phép 📄

Dự án này được chia sẻ cho mục đích giáo dục. Bạn tự do sửa, sao chép, và chia sẻ.

---

**Được phát triển cho**: Lịch sử Đảng - VNR202  
**Năm**: 2025  
**Tác giả**: Nhóm phát triển dự án

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng tạo issue hoặc liên hệ.
