import axios from "axios";
import {
  ApiTimeoutMs,
  FallbackApiBaseUrl,
  PrimaryApiBaseUrl,
} from "@/config/apiConfig";
import i18nCommon from "@/i18n/i18nCommon";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  persistAuthSession,
} from "@/services/authStorage";

const RetryableStatusCodes = [502, 503, 504];
const Text = i18nCommon.ApiErrors;

const refreshTokenViaHttp = async () => {
  const RefreshToken = getStoredRefreshToken();
  const PersistMode = localStorage.getItem("DORM_MART_SESSION_PERSIST") === "local";
  if (!RefreshToken) return null;

  const Response = await axios.post(`${PrimaryApiBaseUrl}/auth/refresh-token`, {
    RefreshToken,
  }, {
    timeout: ApiTimeoutMs,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const AuthData = Response.data?.Data;
  if (!AuthData?.AccessToken || !AuthData?.User) return null;

  persistAuthSession({
    AccessToken: AuthData.AccessToken,
    RefreshToken: AuthData.RefreshToken,
    ExpiresAt: AuthData.ExpiresAt,
    User: AuthData.User,
    RememberMe: PersistMode,
  });

  return AuthData.AccessToken;
};

const axiosInstance = axios.create({
  baseURL: PrimaryApiBaseUrl,
  timeout: ApiTimeoutMs,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const Token = getStoredAccessToken();
    if (Token) {
      config.headers.Authorization = `Bearer ${Token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Lấy status code nếu có, mặc định 0 nếu lỗi không có response (network error)
    const Status = error.response?.status;
    const RequestConfig = error.config;
    const ShouldUseFallback =
      RequestConfig &&
      !RequestConfig.HasRetriedWithFallback &&
      RequestConfig.baseURL !== FallbackApiBaseUrl &&
      (!error.response || RetryableStatusCodes.includes(Status));

    if (ShouldUseFallback) {
      const FallbackRequestConfig = {
        ...RequestConfig,
        baseURL: FallbackApiBaseUrl,
        HasRetriedWithFallback: true,
      };

      console.warn(
        `[API] Không kết nối được ${RequestConfig.baseURL}. Chuyển sang ${FallbackApiBaseUrl}`,
      );

      return axiosInstance(FallbackRequestConfig);
    }

    const CanRefreshToken =
      status === 401 &&
      RequestConfig &&
      !RequestConfig.HasRetriedAfterRefresh &&
      !String(RequestConfig.url || "").includes("/auth/login") &&
      !String(RequestConfig.url || "").includes("/auth/refresh-token");

    if (CanRefreshToken) {
      try {
        const NewAccessToken = await refreshTokenViaHttp();
        if (NewAccessToken) {
          return axiosInstance({
            ...RequestConfig,
            HasRetriedAfterRefresh: true,
            headers: {
              ...RequestConfig.headers,
              Authorization: `Bearer ${NewAccessToken}`,
            },
          });
        }
      } catch {
        clearAuthSession();
      }
    }

    if (status === 401) {
      clearAuthSession();
      console.error("[API] Unauthorized - Token không hợp lệ hoặc đã hết hạn");
    }

    if (status === 403) {
      console.error("[API] Forbidden - Không có quyền truy cập");
    }

    if (status === 404) {
      console.error("[API] Not Found - Tài nguyên không tồn tại");
    }

    if (status === 500) {
      console.error("[API] Internal Server Error");
    }

    if (!error.response) {
      console.error(`[API] ${Text.NetworkError}`);
    }

    return Promise.reject({
      status: status || 0,
      message: error.response?.data?.UserMessage || error.response?.data?.DevMessage || error.message || "Có lỗi xảy ra",
      data: error.response?.data || null,
    });
  }
);

export default axiosInstance;
