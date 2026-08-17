const ApiProtocol = import.meta.env.VITE_API_PROTOCOL || "https";
const ApiPort = import.meta.env.VITE_API_PORT || "7173";
const ApiPath = import.meta.env.VITE_API_PATH || "/api";
const PrimaryApiHost = import.meta.env.VITE_API_PRIMARY_HOST || "trandanghieu.online";
const FallbackApiHost = import.meta.env.VITE_API_FALLBACK_HOST || "127.0.0.0";
const ApiTimeoutMs = Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000);

/**
 * Chuẩn hóa path API để luôn bắt đầu bằng dấu gạch chéo.
 *
 * @param {string} Path Path cần chuẩn hóa
 * @returns {string} Path API hợp lệ
 */
const normalizeApiPath = (Path) => (Path.startsWith("/") ? Path : `/${Path}`);

/**
 * Tạo địa chỉ API từ protocol, host, port và path.
 *
 * @param {string} Host Host của backend
 * @returns {string} Địa chỉ API hoàn chỉnh
 */
const buildApiBaseUrl = (Host) =>
  `${ApiProtocol}://${Host}:${ApiPort}${normalizeApiPath(ApiPath)}`;

const PrimaryApiBaseUrl =
  import.meta.env.VITE_API_PRIMARY_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  buildApiBaseUrl(PrimaryApiHost);

const FallbackApiBaseUrl =
  import.meta.env.VITE_API_FALLBACK_BASE_URL || buildApiBaseUrl(FallbackApiHost);

export {
  ApiTimeoutMs,
  FallbackApiBaseUrl,
  PrimaryApiBaseUrl,
};
