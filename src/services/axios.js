import axios from "axios";

/**
 * Khởi tạo instance axios và cấu hình các interceptor.
 *
 * Sử dụng khi: Các API service cần một client HTTP đã được cấu hình sẵn baseURL và xử lý lỗi.
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7173/api",
  // timeout: 15000, // 15 giây
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Cấu hình interceptor (Chặn một request hoặc response ở giữa quá trình xử lý để thực hiện thêm logic trước khi nó đi tiếp) cho request và response để xử lý token và lỗi toàn cục.
 * Tự động gắn token vào header trước mỗi request.
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
axiosInstance.interceptors.request.use(
  /**
   * Chặn request trước khi gửi đi để đính kèm token hoặc config cần thiết.
   *
   * Sử dụng khi: Cần thêm header xác thực cho toàn bộ các call API.
   *
   * @param {Object} config Cấu hình của request
   * @returns {Object} Cấu hình request đã được sửa đổi
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  (config) => {
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

/**
 * Xử lý lỗi toàn cục (200, 400, 500...)
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
axiosInstance.interceptors.response.use(
  // Trường hợp thành công: trả thẳng data để component không cần .data.data
  /**
   * Trích xuất trực tiếp payload data từ HTTP response.
   *
   * Sử dụng khi: API call thành công, bỏ qua vỏ bọc của axios.
   *
   * @param {Object} response Phản hồi thành công từ axios
   * @returns {any} Phần data thực sự từ API trả về
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  (response) => response.data,

  // Trường hợp lỗi
  /**
   * Xử lý tập trung các lỗi HTTP phổ biến.
   *
   * Sử dụng khi: Server trả về lỗi (4xx, 5xx) hoặc lỗi mạng.
   *
   * @param {Object} error Đối tượng lỗi từ axios
   * @returns {Promise<any>} Promise bị reject mang cấu trúc lỗi đã chuẩn hóa
   *
   * CREATED BY: TDHieu (09/06/2026)
   */
  (error) => {
    // Lấy status code nếu có, mặc định 0 nếu lỗi không có response (network error)
    const status = error.response?.status;

    // Xử lý lỗi 401 Unauthorized: thường do token hết hạn hoặc không hợp lệ
    if (status === 401) {
      // TODO: Xử lý khi token hết hạn: redirect login, refresh token, v.v.
      // localStorage.removeItem("access_token");
      // window.location.href = "/login";
      console.error("[API] Unauthorized - Token không hợp lệ hoặc đã hết hạn");
    }

    // Xử lý lỗi 403 Forbidden: người dùng không có quyền truy cập tài nguyên
    if (status === 403) {
      console.error("[API] Forbidden - Không có quyền truy cập");
    }

    // Xử lý lỗi 404 Not Found: tài nguyên không tồn tại
    if (status === 404) {
      console.error("[API] Not Found - Tài nguyên không tồn tại");
    }

    // Xử lý lỗi 500 Internal Server Error: lỗi máy chủ
    if (status === 500) {
      console.error("[API] Internal Server Error");
    }

    // Xử lý lỗi mạng hoặc lỗi không có response
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
