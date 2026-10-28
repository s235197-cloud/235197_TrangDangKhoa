# ĐỒ ÁN XÂY DỰNG VÀ TRIỂN KHAI ỨNG DỤNG QUẢN LÝ SÁCH FULL-STACK

## 📌 Thông tin sinh viên
- **Họ và tên:** Trang Đăng Khoa
- **Mã số sinh viên (MSSV):** 235197
- **Tên Repository / Database:** `235197_TrangDangKhoa`
- **Tên Collection MongoDB:** `books`

---

## 🛠️ Công nghệ sử dụng
- **Backend:** Node.js, Express.js, Mongoose (MongoDB ODM), Cors, Dotenv.
- **Frontend:** React, Vite, Axios, HTML5/CSS3.
- **Database:** MongoDB Atlas (Cloud Database).
- **Containerization:** Docker, Docker Hub, Multi-stage builds.
- **Deployment Platform:** Render (Web Service & Static Site).

---

## 🔗 Các đường dẫn nộp bài (Submission URLs)

1. **GitHub Repository:**
   `https://github.com/235197-cloud/235197_TrangDangKhoa`

2. **Docker Hub Repositories:**
   - **Backend Image:** `https://hub.docker.com/r/235197trangdangkhoa/backend`
   - **Frontend Image:** `https://hub.docker.com/r/235197trangdangkhoa/frontend`

3. **Render Deployment:**
   - **Frontend Web Application:** `https://two35197-trangdangkhoa-backend.onrender.com/api/books`
   - **Backend API Base URL:** `https://two35197-trangdangkhoa-backend.onrender.com/`
   - **Backend Health Check:** `https://two35197-trangdangkhoa-backend.onrender.com/health`

---

## 🚀 Hướng dẫn chạy ứng dụng cục bộ (Local Development)

### 1. Khởi chạy Backend
```bash
cd backend
npm install
# Tạo tệp .env với nội dung: MONGODB_URI=<chuỗi_kết_nối_mongodb> PORT=5000
npm run dev