import axios from "axios";

// ============================================================
// TẠO INSTANCE AXIOS VỚI BASE URL LẤY TỪ .env
// Thay VITE_API_BASE_URL trong file .env khi có API thật
// ============================================================
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7173/api",
  timeout: 15000, // 15 giây
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// Tự động gắn token vào header trước mỗi request
// ============================================================
axiosInstance.interceptors.request.use(
  (config) => {
    // ============================================================
    // [TẠM THỜI DISABLED] - API hiện tại không yêu cầu access_token
    // Bỏ comment các dòng dưới khi API thật yêu cầu xác thực
    // ============================================================
    // TODO: Thay "access_token" bằng key lưu token thật trong localStorage/sessionStorage
    // const token = localStorage.getItem("access_token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    // TODO: Nếu API yêu cầu thêm header khác (VD: X-Company-Id, X-Branch-Id...) thêm vào đây
    // config.headers["X-Company-Id"] = localStorage.getItem("company_id");

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RESPONSE INTERCEPTOR
// Xử lý lỗi toàn cục (401, 403, 500, network error...)
// ============================================================
axiosInstance.interceptors.response.use(
  // Trường hợp thành công: trả thẳng data để component không cần .data.data
  (response) => response.data,

  // Trường hợp lỗi
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // TODO: Xử lý khi token hết hạn: redirect login, refresh token, v.v.
      // localStorage.removeItem("access_token");
      // window.location.href = "/login";
      console.error("[API] Unauthorized - Token không hợp lệ hoặc đã hết hạn");
    }

    if (status === 403) {
      console.error("[API] Forbidden - Không có quyền truy cập");
    }

    if (status === 500) {
      console.error("[API] Internal Server Error");
    }

    if (!error.response) {
      console.error("[API] Network Error - Không thể kết nối đến server");
    }

    // Trả về object lỗi chuẩn để component tự xử lý
    return Promise.reject({
      status: status || 0,
      message: error.response?.data?.message || error.message || "Có lỗi xảy ra",
      data: error.response?.data || null,
    });
  }
);

export default axiosInstance;
