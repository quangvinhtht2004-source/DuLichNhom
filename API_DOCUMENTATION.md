# 📘 TÀI LIỆU API BACKEND — NHÓM CHỨC NĂNG C: LỊCH TRÌNH CHUYẾN ĐI (ITINERARY MVP)
### Dành cho thành viên Frontend — Dự án TripTogether (QLDLN)

> **Base URL:** `http://localhost:3000` (hoặc `process.env.NEXT_PUBLIC_SITE_URL`)  
> **Phiên bản:** v1.0 (Nhóm C - Itinerary Management & Activities)  
> **Cơ chế xác thực & phân quyền:** Tự động dựa trên **HTTP-Only Cookies** của Supabase Auth. Tất cả API đều yêu cầu người dùng đã đăng nhập và là thành viên được chấp nhận (`status: 'accepted'`) của chuyến đi.

---

## 💡 Lưu ý cốt lõi khi Frontend gọi API

1. **Cơ chế Session (Cookie):**
   - Trình duyệt tự động gửi cookie phiên đăng nhập (`sb-...-auth-token`).
   - Nếu gọi bằng `fetch` trong Client Component cùng domain, cookie tự động được gửi kèm. Nếu gọi từ domain khác, hãy thêm `{ credentials: 'include' }`.
2. **Quyền hạn truy cập (Authorization):**
   - Chỉ những thành viên có bản ghi trong bảng `trip_members` với `trip_id = [tripId]`, `user_id = user.id` và `status = 'accepted'` mới có quyền thao tác (xem, thêm, sửa, xóa, tải ảnh).
   - Nếu chưa đăng nhập: Trả về `401 Unauthorized`.
   - Nếu không phải thành viên hợp lệ: Trả về `403 Forbidden`.
3. **Storage Bucket cho ảnh lịch trình:**
   - Bucket: `itinerary-images` (Public).
   - Backend tự động đặt tên file định dạng: `[tripId]/[itemId]-[timestamp].[ext]`.
   - Khi upload ảnh mới hoặc xóa item, backend tự động dọn dẹp file ảnh cũ trên Supabase Storage.

---

## 📑 Danh mục API

- [1. Quản lý ngày lịch trình (Itinerary Days)](#1-quản-lý-ngày-lịch-trình-itinerary-days)
  - [1.1. Lấy toàn bộ lịch trình chuyến đi (GET /api/trips/[tripId]/itinerary)](#11-lấy-toàn-bộ-lịch-trình-chuyến-đi-get-apitripsctripiditinerary)
  - [1.2. Thêm ngày mới vào lịch trình (POST /api/trips/[tripId]/itinerary)](#12-thêm-ngày-mới-vào-lịch-trình-post-apitripsctripiditinerary)
  - [1.3. Lấy chi tiết một ngày (GET /api/trips/[tripId]/itinerary/[dayId])](#13-lấy-chi-tiết-một-ngày-get-apitripsctripiditinerarycdayid)
  - [1.4. Cập nhật ngày / ghi chú (PATCH /api/trips/[tripId]/itinerary/[dayId])](#14-cập-nhật-ngày--ghi-chú-patch-apitripsctripiditinerarycdayid)
  - [1.5. Xóa ngày khỏi lịch trình (DELETE /api/trips/[tripId]/itinerary/[dayId])](#15-xóa-ngày-khỏi-lịch-trình-delete-apitripsctripiditinerarycdayid)
- [2. Quản lý hoạt động (Itinerary Items)](#2-quản-lý-hoạt-động-itinerary-items)
  - [2.1. Lấy danh sách hoạt động theo ngày (GET /api/trips/[tripId]/itinerary/[dayId]/items)](#21-lấy-danh-sách-hoạt-động-theo-ngày-get-apitripsctripiditinerarycdayiditems)
  - [2.2. Thêm hoạt động vào ngày (POST /api/trips/[tripId]/itinerary/[dayId]/items)](#22-thêm-hoạt-động-vào-ngày-post-apitripsctripiditinerarycdayiditems)
  - [2.3. Sắp xếp lại thứ tự hoạt động (POST /api/trips/[tripId]/itinerary/[dayId]/items/reorder)](#23-sắp-xếp-lại-thứ-tự-hoạt-động-post-apitripsctripiditinerarycdayiditemsreorder)
  - [2.4. Cập nhật hoạt động & Di chuyển ngày (PATCH /api/trips/[tripId]/itinerary/[dayId]/items/[itemId])](#24-cập-nhật-hoạt-động--di-chuyển-ngày-patch-apitripsctripiditinerarycdayiditemscitemid)
  - [2.5. Xóa hoạt động (DELETE /api/trips/[tripId]/itinerary/[dayId]/items/[itemId])](#25-xóa-hoạt-động-delete-apitripsctripiditinerarycdayiditemscitemid)
- [3. Tải lên và Quản lý ảnh hoạt động](#3-tải-lên-và-quản-lý-ảnh-hoạt-động)
  - [3.1. Upload ảnh hoạt động (POST /api/trips/[tripId]/itinerary/[dayId]/items/[itemId]/image)](#31-upload-ảnh-hoạt-động-post-apitripsctripiditinerarycdayiditemscitemidimage)
- [4. Bảng mã lỗi HTTP](#4-bảng-mã-lỗi-http)

---

## 1. Quản lý ngày lịch trình (Itinerary Days)

### 1.1. Lấy toàn bộ lịch trình chuyến đi
Lấy danh sách tất cả các ngày trong chuyến đi kèm theo toàn bộ hoạt động của từng ngày (đã được sắp xếp sẵn theo `day_index` tăng dần và `position` hoạt động tăng dần).

* **Method:** `GET`
* **Endpoint:** `/api/trips/[tripId]/itinerary`
* **Response thành công (200 OK):**
```json
{
  "days": [
    {
      "id": "e7b0a880-60a6-42bb-9279-d57b5fb901fa",
      "trip_id": "8ca03c94-c7ef-4890-9516-ec8d781b0ff4",
      "day_index": 1,
      "day_date": "2026-10-01",
      "notes": "Ngày đầu khám phá trung tâm thành phố",
      "created_at": "2026-09-24T08:00:00.000Z",
      "updated_at": "2026-09-24T08:00:00.000Z",
      "itinerary_items": [
        {
          "id": "b34df4e2-6d2c-47bc-8fb2-53697960fa22",
          "day_id": "e7b0a880-60a6-42bb-9279-d57b5fb901fa",
          "title": "Check-in khách sạn & Nghỉ ngơi",
          "start_time": "14:00",
          "end_time": "15:00",
          "location_name": "Khách sạn Mường Thanh Luxury",
          "latitude": 16.054407,
          "longitude": 108.202167,
          "note": "Mang CCCD để làm thủ tục nhận phòng",
          "image_url": "https://[project].supabase.co/storage/v1/object/public/itinerary-images/...",
          "position": 0,
          "created_by": "5a3cf5c7-a822-480b-8995-013099d9b214",
          "created_at": "2026-09-24T08:15:00.000Z",
          "updated_at": "2026-09-24T08:15:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 1.2. Thêm ngày mới vào lịch trình
Tạo một ngày mới trong lịch trình chuyến đi.

* **Method:** `POST`
* **Endpoint:** `/api/trips/[tripId]/itinerary`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "day_date": "2026-10-02",
  "notes": "Khám phá bán đảo Sơn Trà & Ngũ Hành Sơn"
}
```
* **Chi tiết tham số:**
  - `day_date` (*string, bắt buộc*): Định dạng `YYYY-MM-DD`.
  - `notes` (*string, tùy chọn*): Ghi chú tổng quan cho ngày.
* **Quy tắc Backend xử lý tự động:**
  - `day_index` sẽ được tự động tính: nếu chuyến đi có `start_date`, số ngày chênh lệch = `(day_date - start_date) + 1`; nếu chuyến đi chưa có ngày bắt đầu, `day_index = tổng số ngày hiện có + 1`.
* **Response thành công (201 Created):**
```json
{
  "day": {
    "id": "f8a0b991-71b7-43cc-8380-e68c6fc012ab",
    "trip_id": "8ca03c94-c7ef-4890-9516-ec8d781b0ff4",
    "day_index": 2,
    "day_date": "2026-10-02",
    "notes": "Khám phá bán đảo Sơn Trà & Ngũ Hành Sơn",
    "created_at": "2026-09-24T08:30:00.000Z",
    "updated_at": "2026-09-24T08:30:00.000Z"
  }
}
```
* **Response lỗi:**
  - `400 Bad Request`: `{ "error": "day_date là bắt buộc" }`
  - `409 Conflict`: `{ "error": "Ngày này đã có trong lịch trình" }` (ngăn trùng ngày)

---

### 1.3. Lấy chi tiết một ngày
* **Method:** `GET`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]`
* **Response thành công (200 OK):**
```json
{
  "day": {
    "id": "e7b0a880-60a6-42bb-9279-d57b5fb901fa",
    "trip_id": "8ca03c94-c7ef-4890-9516-ec8d781b0ff4",
    "day_index": 1,
    "day_date": "2026-10-01",
    "notes": "Ngày đầu khám phá trung tâm thành phố",
    "itinerary_items": [ ... ]
  }
}
```
* **Response lỗi (404 Not Found):** `{ "error": "Không tìm thấy ngày này" }`

---

### 1.4. Cập nhật ngày / ghi chú
* **Method:** `PATCH`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "day_date": "2026-10-03",
  "notes": "Đổi sang đi VinWonders"
}
```
*(Gửi một hoặc cả hai trường)*.
* **Response thành công (200 OK):** Trả về `{ "day": { ... } }`.
* **Response lỗi (400 Bad Request):** `{ "error": "Không có dữ liệu để cập nhật" }`

---

### 1.5. Xóa ngày khỏi lịch trình
* **Method:** `DELETE`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]`
* **Response thành công (200 OK):**
```json
{
  "success": true
}
```
> *Lưu ý:* Cơ sở dữ liệu sẽ tự động xóa cascade toàn bộ các hoạt động (`itinerary_items`) thuộc về ngày bị xóa.

---

## 2. Quản lý hoạt động (Itinerary Items)

### 2.1. Lấy danh sách hoạt động theo ngày
* **Method:** `GET`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]/items`
* **Response thành công (200 OK):**
```json
{
  "items": [
    {
      "id": "b34df4e2-6d2c-47bc-8fb2-53697960fa22",
      "day_id": "e7b0a880-60a6-42bb-9279-d57b5fb901fa",
      "title": "Ăn trưa mì Quảng Ếch Bếp Trang",
      "start_time": "12:00",
      "end_time": "13:30",
      "location_name": "441 Ông Ích Khiêm",
      "latitude": 16.0645,
      "longitude": 108.2123,
      "note": "Nên gọi thêm ram bắp",
      "image_url": null,
      "position": 0,
      "created_by": "5a3cf5c7-a822-480b-8995-013099d9b214"
    }
  ]
}
```

---

### 2.2. Thêm hoạt động vào ngày
* **Method:** `POST`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]/items`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "title": "Tắm biển Mỹ Khê",
  "start_time": "16:00",
  "end_time": "18:00",
  "location_name": "Bãi tắm Phạm Văn Đồng",
  "latitude": 16.0682,
  "longitude": 108.2465,
  "note": "Mang theo đồ bơi và kem chống nắng",
  "image_url": null
}
```
* **Chi tiết tham số:**
  - `title` (*string, bắt buộc*): Tên hoạt động.
  - `start_time` (*string, tùy chọn*): Giờ bắt đầu (định dạng `HH:mm` hoặc để `""` / `null`).
  - `end_time` (*string, tùy chọn*): Giờ kết thúc (định dạng `HH:mm` hoặc để `""` / `null`).
  - `location_name` (*string, tùy chọn*): Tên địa điểm hiển thị.
  - `latitude`, `longitude` (*number, tùy chọn*): Tọa độ địa lý trên bản đồ.
  - `note` (*string, tùy chọn*): Ghi chú bổ sung.
  - `image_url` (*string, tùy chọn*): Đường dẫn ảnh nếu có sẵn.
* **Quy tắc Backend xử lý tự động:**
  - Hoạt động mới sẽ tự động nhận giá trị `position = max(position) + 1` để luôn nằm ở cuối danh sách của ngày đó.
* **Response thành công (201 Created):**
```json
{
  "item": {
    "id": "c45ef5f3-7e3d-58cd-90c3-64708071ab33",
    "day_id": "e7b0a880-60a6-42bb-9279-d57b5fb901fa",
    "title": "Tắm biển Mỹ Khê",
    "position": 1,
    ...
  }
}
```

---

### 2.3. Sắp xếp lại thứ tự hoạt động (Reorder)
Dùng cho tính năng kéo thả (Drag and Drop) danh sách các hoạt động trong cùng một ngày.

* **Method:** `POST`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]/items/reorder`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "order": [
    "item-uuid-3",
    "item-uuid-1",
    "item-uuid-2"
  ]
}
```
* **Chi tiết tham số:**
  - `order` (*string[], bắt buộc*): Mảng chứa toàn bộ các ID của hoạt động trong ngày theo thứ tự mới từ trên xuống dưới. Backend sẽ tự động cập nhật `position` tương ứng (0, 1, 2,...).
* **Response thành công (200 OK):**
```json
{
  "success": true
}
```
* **Response lỗi:**
  - `400 Bad Request`: `{ "error": "order phải là mảng itemId" }`
  - `404 Not Found`: `{ "error": "Ngày không tồn tại hoặc không thuộc chuyến đi này" }`

---

### 2.4. Cập nhật hoạt động & Di chuyển ngày
Cập nhật nội dung hoạt động hoặc **di chuyển hoạt động sang ngày khác trong chuyến đi**.

* **Method:** `PATCH`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]/items/[itemId]`
* **Headers:** `Content-Type: application/json`
* **Request Body:** Gửi các trường cần sửa:
```json
{
  "title": "Ăn tối hải sản Năm Đảnh",
  "start_time": "19:00",
  "end_time": "21:00",
  "day_id": "new-day-uuid"
}
```
* **Tính năng di chuyển ngày (`day_id`):**
  - Nếu truyền `day_id` mới (phải thuộc cùng `tripId`), backend sẽ chuyển hoạt động sang ngày đó.
  - Nếu không chỉ định `position`, backend sẽ tự động xếp hoạt động vào cuối ngày mới.
* **Response thành công (200 OK):** Trả về `{ "item": { ... } }`.
* **Response lỗi (400 Bad Request):**
  - `{ "error": "Không có dữ liệu để cập nhật" }`
  - `{ "error": "Ngày đích không thuộc chuyến đi này" }`

---

### 2.5. Xóa hoạt động
Xóa một hoạt động khỏi lịch trình.

* **Method:** `DELETE`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]/items/[itemId]`
* **Response thành công (200 OK):**
```json
{
  "success": true
}
```

---

## 3. Tải lên và Quản lý ảnh hoạt động

### 3.1. Upload ảnh hoạt động
Upload ảnh đính kèm cho hoạt động lên Supabase Storage bucket `itinerary-images` và lưu URL vào trường `image_url` của hoạt động.

* **Method:** `POST`
* **Endpoint:** `/api/trips/[tripId]/itinerary/[dayId]/items/[itemId]/image`
* **Headers:** Không set `Content-Type` thủ công, để trình duyệt tự gán `multipart/form-data; boundary=...`.
* **Request Body (`FormData`):**
  - Key: `file` (File dạng Binary)
* **Quy chuẩn Upload:**
  - Dung lượng tối đa: **5MB**.
  - Định dạng hợp lệ: `.jpeg`, `.jpg`, `.png`, `.webp`.
  - Tự động dọn dẹp: Nếu hoạt động đã có ảnh trước đó, backend sẽ tự động gửi yêu cầu xóa file ảnh cũ khỏi Supabase Storage để tiết kiệm dung lượng.
* **Response thành công (200 OK):**
```json
{
  "item": {
    "id": "b34df4e2-6d2c-47bc-8fb2-53697960fa22",
    "image_url": "https://[project].supabase.co/storage/v1/object/public/itinerary-images/trip-id/item-id-1727165000000.png",
    "updated_at": "2026-09-24T08:45:00.000Z",
    ...
  }
}
```
* **Response lỗi:**
  - `400 Bad Request`: `{ "error": "file là bắt buộc" }`
  - `400 Bad Request`: `{ "error": "Chỉ chấp nhận ảnh JPEG, PNG hoặc WEBP" }`
  - `400 Bad Request`: `{ "error": "Kích thước ảnh tối đa 5MB" }`
  - `404 Not Found`: `{ "error": "Hoạt động không tồn tại hoặc không thuộc ngày này" }`

* **Ví dụ code React Frontend:**
```typescript
const handleUploadImage = async (tripId: string, dayId: string, itemId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}/items/${itemId}/image`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error)
  return data.item // item đã có image_url mới
}
```

---

## 4. Bảng mã lỗi HTTP

| HTTP Code | Ý nghĩa | Xử lý khuyến nghị phía Frontend |
|---|---|---|
| `200 OK` | Lấy dữ liệu, cập nhật hoặc xóa thành công | Cập nhật UI / State tương ứng |
| `201 Created` | Tạo mới ngày hoặc hoạt động thành công | Đưa item mới vào danh sách hiển thị |
| `400 Bad Request` | Thiếu field bắt buộc, file quá 5MB, format sai | Hiển thị Toast/Alert với nội dung `error` từ backend |
| `401 Unauthorized` | Chưa đăng nhập hoặc cookie hết hạn | Redirect người dùng về trang `/login` |
| `403 Forbidden` | Không phải thành viên hợp lệ của chuyến đi | Hiển thị thông báo "Bạn không có quyền truy cập chuyến đi này" |
| `404 Not Found` | Không tìm thấy chuyến đi, ngày hoặc hoạt động | Hiển thị thông báo hoặc quay lại trang danh sách |
| `409 Conflict` | Trùng ngày `day_date` trong chuyến đi | Nhắc người dùng chọn ngày khác |
| `500 Internal Error` | Lỗi máy chủ hoặc Supabase | Hiển thị thông báo "Có lỗi xảy ra, vui lòng thử lại sau" |
