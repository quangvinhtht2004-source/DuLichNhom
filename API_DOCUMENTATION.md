# 📘 TÀI LIỆU HƯỚNG DẪN TÍCH HỢP API BACKEND
### Dành cho thành viên Frontend — Dự án TripTogether

> **Base URL:** `http://localhost:3000` (hoặc `process.env.NEXT_PUBLIC_SITE_URL`)  
> **Phiên bản:** v1.0 (Nhóm chức năng A - Authentication & User Management)  
> **Cơ chế xác thực:** Tự động lưu và gửi qua **HTTP-Only Cookies** (không cần lưu token vào localStorage).

---

## 💡 Lưu ý cốt lõi khi Frontend gọi API

1. **Cơ chế Session (Cookie):**
   * Khi gọi `/api/auth/login` hoặc `/api/auth/register` thành công, trình duyệt sẽ **tự động lưu Cookie** phiên đăng nhập (`sb-...-auth-token`).
   * Các request tiếp theo (`/api/auth/profile`, `/api/auth/logout`,...) nếu gọi từ Client Component (`fetch` hoặc `axios`), cookie sẽ **tự động được đính kèm** (nếu dùng `fetch` trong cùng domain thì mặc định đã bật, nếu khác domain nhớ thêm `{ credentials: 'include' }`).
2. **Xử lý chuyển hướng sau khi Đăng nhập/Đăng ký:**
   * Sau khi API trả về `{ user, session }`, Frontend dùng `useRouter()` của Next.js để điều hướng:
     ```typescript
     router.push('/dashboard') // hoặc /trips
     router.refresh() // làm mới server components để nhận diện user mới
     ```
3. **Tài khoản kiểm thử có sẵn:**
   * **Email:** `test@dulichnhom.com`
   * **Mật khẩu:** `Password123@!`

---

## 📑 Danh mục API

- [1. Đăng ký tài khoản (Register)](#1-đăng-ký-tài-khoản-post-apiauthregister)
- [2. Đăng nhập (Login)](#2-đăng-nhập-post-apiauthlogin)
- [3. Đăng xuất (Logout)](#3-đăng-xuất-post-apiauthlogout)
- [4. Xem thông tin cá nhân (Get Profile)](#4-xem-hồ-sơ-cá-nhân-get-apiauthprofile)
- [5. Cập nhật hồ sơ cá nhân (Update Profile)](#5-cập-nhật-hồ-sơ-patch-apiauthprofile)
- [6. Tải lên ảnh đại diện (Upload Avatar)](#6-tải-lên-ảnh-đại-diện-post-apiauthprofileavatar)
- [7. Yêu cầu quên mật khẩu (Forgot Password)](#7-quên-mật-khẩu-post-apiauthforgot-password)
- [8. Đặt lại mật khẩu mới (Reset Password)](#8-đặt-lại-mật-khẩu-mới-post-apiauthreset-password)
- [9. Đăng nhập bằng Google (Google OAuth)](#9-đăng-nhập-google-oauth-get-apiauthgoogle)

---

### 1. Đăng ký tài khoản (`POST /api/auth/register`)

Tạo tài khoản mới bằng email và mật khẩu. Tự động kích hoạt tài khoản và tạo hồ sơ trong cơ sở dữ liệu.

* **Method:** `POST`
* **Endpoint:** `/api/auth/register`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "user@gmail.com",
    "password": "Password123@!",
    "full_name": "Nguyễn Văn A"
  }
  ```
* **Ràng buộc:**
  * `email` (bắt buộc, đúng định dạng email).
  * `password` (bắt buộc, tối thiểu 6 ký tự).
  * `full_name` (tùy chọn).

* **Response thành công (200 OK):**
  ```json
  {
    "user": {
      "id": "5a3cf5c7-a822-480b-8995-013099d9b214",
      "email": "user@gmail.com",
      "user_metadata": {
        "full_name": "Nguyễn Văn A"
      }
    },
    "session": {
      "access_token": "eyJhbGci...",
      "refresh_token": "..."
    }
  }
  ```

* **Response lỗi (400 Bad Request):**
  ```json
  { "error": "email và password là bắt buộc" }
  // hoặc
  { "error": "Mật khẩu phải có ít nhất 6 ký tự" }
  // hoặc
  { "error": "User already registered" }
  ```

* **Ví dụ code Frontend (React):**
  ```typescript
  const handleRegister = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Đăng ký thành công -> Chuyển vào dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };
  ```

---

### 2. Đăng nhập (`POST /api/auth/login`)

Đăng nhập bằng email và mật khẩu đã tạo.

* **Method:** `POST`
* **Endpoint:** `/api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "test@dulichnhom.com",
    "password": "Password123@!"
  }
  ```

* **Response thành công (200 OK):**
  *(Server tự động gán Set-Cookie lưu phiên đăng nhập)*
  ```json
  {
    "user": {
      "id": "5a3cf5c7-a822-480b-8995-013099d9b214",
      "email": "test@dulichnhom.com"
    },
    "session": {
      "access_token": "eyJhbGci..."
    }
  }
  ```

* **Response lỗi:**
  * `400 Bad Request`: `{ "error": "email và password là bắt buộc" }`
  * `400 / 401 Unauthorized`: `{ "error": "Invalid login credentials" }`

* **Ví dụ code Frontend:**
  ```typescript
  const handleLogin = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Email hoặc mật khẩu không chính xác');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };
  ```

---

### 3. Đăng xuất (`POST /api/auth/logout`)

Hủy phiên đăng nhập và xóa sạch cookie xác thực.

* **Method:** `POST`
* **Endpoint:** `/api/auth/logout`
* **Headers:** *(Không cần)*
* **Request Body:** *(Để trống)*

* **Response thành công (200 OK):**
  ```json
  { "success": true }
  ```

* **Ví dụ code Frontend:**
  ```typescript
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };
  ```

---

### 4. Xem hồ sơ cá nhân (`GET /api/auth/profile`)

Lấy thông tin chi tiết của người dùng đang đăng nhập từ bảng `profiles`.

* **Method:** `GET`
* **Endpoint:** `/api/auth/profile`
* **Headers:** *(Tự động nhận diện Cookie phiên)*

* **Response thành công (200 OK):**
  ```json
  {
    "profile": {
      "id": "5a3cf5c7-a822-480b-8995-013099d9b214",
      "full_name": "Nguyễn Văn Test",
      "avatar_url": "https://duhtigwflaicjxlyxcpn.supabase.co/storage/v1/object/public/avatars/...",
      "phone": "0912345678",
      "created_at": "2026-09-21T11:22:11.406313+00:00",
      "updated_at": "2026-09-21T11:22:11.406313+00:00"
    }
  }
  ```

* **Response lỗi (401 Unauthorized):**
  ```json
  { "error": "Chưa đăng nhập" }
  ```

---

### 5. Cập nhật hồ sơ (`PATCH /api/auth/profile`)

Chỉnh sửa họ và tên hoặc số điện thoại của người dùng.

* **Method:** `PATCH`
* **Endpoint:** `/api/auth/profile`
* **Headers:** `Content-Type: application/json`
* **Request Body:** *(Chỉ cần gửi trường muốn cập nhật)*
  ```json
  {
    "full_name": "Nguyễn Văn A (Đã cập nhật)",
    "phone": "0988888888"
  }
  ```

* **Response thành công (200 OK):**
  ```json
  {
    "profile": {
      "id": "5a3cf5c7-a822-480b-8995-013099d9b214",
      "full_name": "Nguyễn Văn A (Đã cập nhật)",
      "avatar_url": null,
      "phone": "0988888888",
      "created_at": "2026-09-21T11:22:11.406313+00:00",
      "updated_at": "2026-09-21T11:45:00.000000+00:00"
    }
  }
  ```

* **Response lỗi:**
  * `400 Bad Request`: `{ "error": "Không có dữ liệu để cập nhật" }`
  * `401 Unauthorized`: `{ "error": "Chưa đăng nhập" }`

---

### 6. Tải lên ảnh đại diện (`POST /api/auth/profile/avatar`)

Tải ảnh trực tiếp lên Supabase Storage bucket `avatars` và cập nhật đường dẫn `avatar_url` vào bảng `profiles`.

* **Method:** `POST`
* **Endpoint:** `/api/auth/profile/avatar`
* **Headers:** `Content-Type: multipart/form-data` *(Lưu ý: Khi dùng `fetch` với `FormData`, không cần tự set header này, trình duyệt sẽ tự gán boundary)*
* **Form Data:**
  * Key: `file` (File ảnh được chọn từ `<input type="file" />`)
* **Ràng buộc file:**
  * Định dạng: `image/jpeg`, `image/png`, `image/webp`.
  * Dung lượng: Tối đa **5MB**.

* **Response thành công (200 OK):**
  ```json
  {
    "profile": {
      "id": "5a3cf5c7-a822-480b-8995-013099d9b214",
      "full_name": "Nguyễn Văn Test",
      "avatar_url": "https://duhtigwflaicjxlyxcpn.supabase.co/storage/v1/object/public/avatars/user-id/1726919000.jpg",
      "phone": null,
      "created_at": "2026-09-21T11:22:11.406313+00:00",
      "updated_at": "2026-09-21T11:47:00.000000+00:00"
    }
  }
  ```

* **Ví dụ code Frontend:**
  ```typescript
  const handleUploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/auth/profile/avatar', {
      method: 'POST',
      body: formData, // không set Content-Type
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Cập nhật state hiển thị avatar mới
    setAvatarUrl(data.profile.avatar_url);
  };
  ```

---

### 7. Quên mật khẩu (`POST /api/auth/forgot-password`)

Gửi email chứa liên kết đặt lại mật khẩu về hộp thư người dùng.

* **Method:** `POST`
* **Endpoint:** `/api/auth/forgot-password`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "user@gmail.com"
  }
  ```

* **Response thành công (200 OK):**
  ```json
  { "success": true }
  ```

---

### 8. Đặt lại mật khẩu mới (`POST /api/auth/reset-password`)

Được gọi sau khi người dùng bấm vào link trong email đặt lại mật khẩu (đã được xác thực qua callback).

* **Method:** `POST`
* **Endpoint:** `/api/auth/reset-password`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "password": "NewSecretPassword123@"
  }
  ```

* **Response thành công (200 OK):**
  ```json
  { "success": true }
  ```

* **Response lỗi:**
  * `400 Bad Request`: `{ "error": "password phải có ít nhất 6 ký tự" }`
  * `401 Unauthorized`: `{ "error": "Phiên đặt lại mật khẩu đã hết hạn hoặc không hợp lệ" }`

---

### 9. Đăng nhập Google OAuth (`GET /api/auth/google`)

Khởi động quy trình đăng nhập bằng tài khoản Google.

* **Cách dùng phía Frontend:**
  Frontend **không cần gọi `fetch()`**, chỉ cần gán link cho nút Đăng nhập Google:
  ```tsx
  // Cách 1: Thẻ link
  <a href="/api/auth/google">Đăng nhập với Google</a>

  // Cách 2: onClick trên Button
  <button onClick={() => window.location.href = '/api/auth/google'}>
    Đăng nhập với Google
  </button>
  ```
* **Luồng hoạt động:**
  1. Trình duyệt chuyển hướng đến màn hình chọn tài khoản Google.
  2. Google xác thực và gọi về `/api/auth/callback`.
  3. Backend lưu cookie đăng nhập và redirect người dùng về trang chủ (hoặc dashboard).

---

## 📦 TypeScript Types sẵn có cho Frontend

Frontend có thể import trực tiếp các kiểu dữ liệu từ file `@/types/database`:

```typescript
import type { 
  Profile, 
  Trip, 
  TripMember, 
  ItineraryItem, 
  Expense, 
  ExpenseSplit, 
  Checklist 
} from '@/types/database';

// Ví dụ sử dụng:
const [userProfile, setUserProfile] = useState<Profile | null>(null);
```
