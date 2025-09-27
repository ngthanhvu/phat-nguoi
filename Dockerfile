# Sử dụng image Node.js chính thức
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở port ứng dụng (thường là 3000)
EXPOSE 5001

# Lệnh để chạy ứng dụng Node.js
CMD ["npm", "start"]
