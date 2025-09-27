# Phạt nguội api
Dự án này cho phép nhanh chóng tạo server để tra cứu các vi phạm giao thông sử dụng số biển số xe. Sử dụng dữ liệu từ csgt.vn
## Tính năng
- Nhanh chóng tạo REST API để tra cứu vi phạm giao thông
- Auto retry nếu xác minh captcha thất bại
- Trích xuất và hiển thị thông tin vi phạm giao thông
## Cài đặt
### Yêu cầu
- Node.js (phiên bản 14 hoặc cao hơn)
- npm (Trình quản lý gói Node)
- Docker
### Các bước cài đặt
1. Clone repository:
```sh
git clone https://github.com/ngthanhvu/phat-nguoi.git
cd phatnguoi-api
```
2. Cài đặt các thư viện:
```sh
npm install
```
### Chạy với docker
1. Clone repository:
```sh
git clone https://github.com/ngthanhvu/phat-nguoi.git
cd phatnguoi-api
```
2. Build Docker image
```sh
docker build -t phat-nguoi .
```
3. Chạy container từ image vừa build
```sh
docker run -d -p 3000:3000 --name my-node-container phat-nguoi
```
## Sử dụng
### Chạy server REST API
1. Chạy server:
```sh
npm run start
```
2. Gửi yêu cầu GET đến endpoint `/api` với tham số `licensePlate`:
```sh
curl "http://localhost:3000/api?licensePlate=30H47465"
```
3. Gửi yêu cầu cho các loại xe `xe máy` hoặc `xe điện` kèm tham số `vehicleType`
```sh
curl "http://localhost:3000/api?licensePlate=30H47465&vehicleType=motorcycle"
```
## Cấu trúc dự án
- `src/apiCaller.js`: Chứa logic chính để tương tác với API tra cứu vi phạm giao thông.
- `src/extractTrafficViolations.js`: Hàm tiện ích để trích xuất thông tin vi phạm giao thông từ phản hồi API.
- `server.js`: Thiết lập server Express.js với endpoint REST API.
## Giấy phép
Dự án này được cấp phép theo Giấy phép MIT. Xem tệp [LICENSE](LICENSE) để biết chi tiết.