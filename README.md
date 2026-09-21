# ✈️ TripTogether — Quản Lý & Lên Kế Hoạch Du Lịch Nhóm

> **"Khám phá thế giới cùng hội bạn thân — Shared journeys made effortless."**  
> Nền tảng web hiện đại hỗ trợ lập kế hoạch, phân chia công việc, quản lý lịch trình và tự động tối ưu hóa công nợ chi tiêu cho các chuyến du lịch nhóm.

---

## 📌 Mục lục
- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng-tech-stack)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục-project-structure)
- [Hướng dẫn cài đặt & Chạy cục bộ](#-hướng-dẫn-cài-đặt--chạy-cục-bộ)
- [Cấu hình biến môi trường (.env)](#-cấu-hình-biến-môi-trường-env)
- [Tài liệu API Backend (Nhóm A - Authentication)](#-tài-liệu-api-backend-nhóm-a---authentication)
- [Cơ sở dữ liệu & Supabase](#-cơ-sở-dữ-liệu--supabase)
- [Lộ trình phát triển (Roadmap)](#-lộ-trình-phát-triển-roadmap)

---

## 🌟 Giới thiệu

**TripTogether** giải quyết các vấn đề nan giải thường gặp khi đi du lịch nhóm:
1. **Lịch trình rời rạc:** Gom toàn bộ hoạt động theo từng ngày vào một timeline trực quan.
2. **"Ai nợ ai bao nhiêu?":** Ghi nhận chi tiêu, hỗ trợ chia đều hoặc tùy biến, tự động tính toán phương án trả nợ tối ưu với số lần chuyển khoản ít nhất.
3. **Quên đồ & bỏ sót việc:** Checklist to-do và packing list chung, gán người phụ trách cụ thể.
4. **Mời bạn bè dễ dàng:** Tham gia nhóm nhanh chóng thông qua mã mời (`invite_code`).

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Frontend
- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Thư viện UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Ngôn ngữ:** [TypeScript 5](https://www.typescriptlang.org/)

### Backend & Cloud (BaaS)
- **Database:** PostgreSQL (trên nền tảng [Supabase](https://supabase.com/))
- **Authentication:** Supabase Auth (Email/Password, Google OAuth, Session Cookie qua `@supabase/ssr`)
- **Storage:** Supabase Storage (Lưu trữ avatar, ảnh bìa chuyến đi, ảnh hóa đơn)
- **Bảo mật:** Row Level Security (RLS) bảo vệ dữ liệu ở tầng cơ sở dữ liệu
- **API Architecture:** Next.js Route Handlers (`src/app/api/...`)

---

## 📂 Cấu trúc thư mục (Project Structure)

```text
QLDLN/
├── public/                           # Tài nguyên tĩnh (ảnh, icon, logo)
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # Backend API Endpoints
│   │   │   └── auth/                 # Nhóm API Quản lý tài khoản
│   │   │       ├── register/         # POST /api/auth/register
│   │   │       ├── login/            # POST /api/auth/login
│   │   │       ├── logout/           # POST /api/auth/logout
│   │   │       ├── profile/          # GET, PATCH /api/auth/profile
│   │   │       │   └── avatar/       # POST /api/auth/profile/avatar
│   │   │       ├── forgot-password/  # POST /api/auth/forgot-password
│   │   │       ├── reset-password/   # POST /api/auth/reset-password
│   │   │       ├── google/           # GET /api/auth/google
│   │   │       └── callback/         # GET /api/auth/callback
│   │   ├── favicon.ico
│   │   ├── globals.css               # Global styles & Tailwind v4 config
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Trang chủ (Login / Register Card)
│   │
│   ├── components/                   # React Components
│   │   └── auth-card.tsx             # Giao diện Đăng nhập / Đăng ký
│   │
│   ├── lib/
│   │   └── supabase/                 # Cấu hình kết nối Supabase
│   │       ├── client.ts             # Browser client (cho Client Components)
│   │       ├── server.ts             # Server client (cho Route Handlers, Server Components)
│   │       ├── middleware.ts         # Quản lý & làm mới session cookie
│   │       └── admin.ts              # Admin client với Service Role Key
│   │
│   ├── types/
│   │   └── database.ts               # TypeScript types khớp 17 bảng trên PostgreSQL
│   │
│   └── middleware.ts                 # Next.js Middleware chạy ngầm làm mới session
│
├── .env.example                      # Mẫu biến môi trường
├── .env.local                        # Biến môi trường bí mật (không commit vào git)
├── package.json                      # Dependencies và scripts
├── tsconfig.json                     # Cấu hình TypeScript
└── README.md                         # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ

### 1. Yêu cầu hệ thống
- **Node.js:** Phiên bản 18.18+ hoặc 20+ (Khuyên dùng LTS)
- **Package Manager:** `npm` (đi kèm Node.js) hoặc `pnpm`

### 2. Cài đặt các bước
```bash
# 1. Clone repository về máy
git clone https://github.com/quangvinhtht2004-source/DuLichNhom.git
cd DuLichNhom

# 2. Cài đặt dependencies
npm install

# 3. Tạo file cấu hình môi trường
cp .env.example .env.local

# 4. Chạy dự án ở môi trường Development
npm run dev
```

Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Cấu hình biến môi trường (.env)

Tạo file `.env.local` tại thư mục gốc với các thông số sau (lấy từ Supabase Dashboard):

```env
# URL dự án Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Anon Key (Công khai trên trình duyệt)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Service Role Key (Chỉ dùng phía server - giữ bí mật tuyệt đối)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Địa chỉ trang web (Dùng cho redirect OAuth & reset password)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📡 Tài liệu API Backend (Nhóm A - Authentication)

Tất cả các endpoint đều trả về dữ liệu định dạng **JSON** và sử dụng HTTP-only Cookie để lưu phiên đăng nhập.

| Chức năng | Phương thức | Endpoint | Body (JSON / FormData) | Response thành công |
|---|---|---|---|---|
| **Đăng ký tài khoản** | `POST` | `/api/auth/register` | `{"email", "password", "full_name"}` | `200 OK` + `{ user, session }` |
| **Đăng nhập** | `POST` | `/api/auth/login` | `{"email", "password"}` | `200 OK` + `{ user, session }` *(Set-Cookie)* |
| **Đăng xuất** | `POST` | `/api/auth/logout` | *(Trống)* | `200 OK` + `{"success": true}` |
| **Xem hồ sơ cá nhân** | `GET` | `/api/auth/profile` | *(Trống - nhận diện qua Cookie)* | `200 OK` + `{"profile": {...}}` |
| **Cập nhật hồ sơ** | `PATCH` | `/api/auth/profile` | `{"full_name"?, "phone"?}` | `200 OK` + `{"profile": {...}}` |
| **Tải lên ảnh đại diện** | `POST` | `/api/auth/profile/avatar` | `FormData: file = [ảnh .jpg/.png/.webp <= 5MB]` | `200 OK` + `{"profile": {...}}` |
| **Quên mật khẩu** | `POST` | `/api/auth/forgot-password` | `{"email"}` | `200 OK` + `{"success": true}` |
| **Đặt lại mật khẩu mới** | `POST` | `/api/auth/reset-password` | `{"password"}` | `200 OK` + `{"success": true}` |
| **Đăng nhập Google** | `GET` | `/api/auth/google` | *(Truy cập trực tiếp qua thẻ `<a>`)* | `302 Redirect` tới Google Sign-In |
| **Xác thực Callback** | `GET` | `/api/auth/callback` | Query params: `code`, `next` | `302 Redirect` về URL chỉ định |

---

## 🗄️ Cơ sở dữ liệu & Supabase

Hệ thống được thiết kế trên PostgreSQL với các bảng cốt lõi:
- `profiles`: Hồ sơ người dùng (đồng bộ tự động từ `auth.users` qua trigger `handle_new_user`).
- `trips`: Thông tin chuyến đi, ngày khởi hành, ngày kết thúc, mã mời `invite_code`.
- `trip_members`: Danh sách thành viên và phân quyền (`owner`, `member`).
- `itinerary_days` & `itinerary_items`: Quản lý timeline lịch trình chi tiết theo từng ngày.
- `expenses` & `expense_splits`: Quản lý khoản chi, người chi trả và số tiền từng thành viên nợ.
- `expense_settlements`: Theo dõi công nợ và trạng thái thanh toán giữa các cặp thành viên.
- `checklists` & `checklist_items`: To-do list và danh sách đồ đạc dùng chung.
- `comments`, `chat_messages`, `notifications`: Tương tác nhóm thời gian thực.

### Storage Buckets (Lưu trữ ảnh)
- `avatars` (Public): Ảnh đại diện người dùng.
- `trip-covers` (Public): Ảnh bìa chuyến đi.
- `itinerary-images` (Public): Ảnh hoạt động tại từng điểm đến.
- `receipts` (Private): Hóa đơn chi tiêu phục vụ đối soát.

---

## 🗺️ Lộ trình phát triển (Roadmap)

- [x] **Nhóm A: Quản lý tài khoản & Người dùng** (Đăng ký, Đăng nhập, Profile, Avatar, Đổi mật khẩu, Google OAuth)
- [ ] **Nhóm B: Quản lý chuyến đi (Trip)** (Tạo chuyến đi, Mời thành viên qua mã, Phân quyền Leader/Member)
- [ ] **Nhóm C: Lịch trình chi tiết (Itinerary)** (Tạo timeline theo ngày, kéo thả sắp xếp hoạt động)
- [ ] **Nhóm D: Quản lý chi phí (Expense Splitting)** (Ghi nhận khoản chi, chia tiền, thuật toán tối ưu hóa công nợ "ai nợ ai")
- [ ] **Nhóm E: Checklist & Đồ đạc (Packing List)** (Gán người phụ trách, đánh dấu hoàn thành)
- [ ] **Nhóm F & G: Dashboard & Tương tác nhóm** (Đếm ngược ngày đi, thống kê biểu đồ chi tiêu, realtime sync)

---

## 👥 Thành viên phát triển

Dự án được xây dựng và phát triển song song bởi:
- **Backend Developer:** Quản lý kiến trúc cơ sở dữ liệu Supabase, Authentication, API Route Handlers và thuật toán nghiệp vụ.
- **Frontend Developer:** Thiết kế giao diện UI/UX, tích hợp các trang màn hình, tương tác người dùng và kết nối API.

---

*© 2025 - 2026 TripTogether Inc. Crafted for collaborative wanderlust.*
