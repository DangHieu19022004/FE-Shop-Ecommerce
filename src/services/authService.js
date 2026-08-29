import axiosInstance from "@/services/axios";
import AuthDataMock from "@/data/authData.json";
import {
  clearAuthSession,
  getStoredRefreshToken,
  getStoredSession,
  persistAuthSession,
} from "@/services/authStorage";

const unwrapData = (Response) => Response?.Data ?? null;
const unwrapMessage = (Response) => Response?.UserMessage || Response?.DevMessage || "Có lỗi xảy ra";

const toSessionPayload = (AuthData, RememberMe) => {
  const SessionData = persistAuthSession({
    AccessToken: AuthData.AccessToken,
    RefreshToken: AuthData.RefreshToken,
    ExpiresAt: AuthData.ExpiresAt,
    User: AuthData.User,
    RememberMe,
  });

  return {
    IsSuccess: true,
    SessionData: SessionData.User,
    AuthData: SessionData,
  };
};

export const registerUser = async (RegisterPayload) => {
  try {
    const Response = await axiosInstance.post("/auth/register", {
      FullName: RegisterPayload.FullName.trim(),
      Email: RegisterPayload.Email.trim().toLowerCase(),
      Password: RegisterPayload.Password,
    });

    return {
      IsSuccess: Response?.IsSuccess ?? true,
      Message: Response?.UserMessage || "Đăng ký thành công",
      Data: unwrapData(Response),
    };
  } catch (Error) {
    return {
      IsSuccess: false,
      ErrorCode: Error.status === 409 ? "ACCOUNT_EXISTS" : "REGISTER_FAILED",
      Message: Error.message,
      Errors: Error.data?.errors || [],
    };
  }
};

export const loginUser = async (LoginPayload) => {
  // TẠM THỜI: bỏ qua API đăng nhập để kiểm thử giao diện admin khi backend chưa chạy.
  // Khôi phục khối gọi API bên dưới khi backend sẵn sàng.
  /*
    try {
      const Response = await axiosInstance.post("/auth/login", {
        Email: LoginPayload.Account.trim().toLowerCase(),
        Password: LoginPayload.Password,
      });
      const AuthData = unwrapData(Response);

      if (!AuthData?.AccessToken || !AuthData?.User) {
        return { IsSuccess: false, ErrorCode: "INVALID_RESPONSE", Message: unwrapMessage(Response) };
      }

      return toSessionPayload(AuthData, LoginPayload.RememberMe);
    } catch (Error) {
      return {
        IsSuccess: false,
        ErrorCode: Error.status === 401 ? "INVALID_CREDENTIALS" : "LOGIN_FAILED",
        Message: Error.message,
        Errors: Error.data?.errors || [],
      };
    }
  */

  const MockAuthData = {
    AccessToken: "FRONTEND_ADMIN_TEST_ACCESS_TOKEN",
    RefreshToken: "FRONTEND_ADMIN_TEST_REFRESH_TOKEN",
    ExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    User: AuthDataMock.MockAdminUser,
  };

  return toSessionPayload(MockAuthData, LoginPayload.RememberMe);
};

export const refreshSession = async () => {
  const RefreshToken = getStoredRefreshToken();
  if (!RefreshToken) return null;

  try {
    const Response = await axiosInstance.post("/auth/refresh-token", { RefreshToken });
    const AuthData = unwrapData(Response);
    const CurrentSession = getStoredSession();
    if (!AuthData?.AccessToken || !AuthData?.User || !CurrentSession) return null;
    return toSessionPayload(AuthData, localStorage.getItem("DORM_MART_SESSION_PERSIST") === "local");
  } catch {
    clearAuthSession();
    return null;
  }
};

export const getCurrentSession = () => getStoredSession();

export const getMyProfile = async () => {
  const Response = await axiosInstance.get("/me");
  return unwrapData(Response);
};

export const getMyAddresses = async () => {
  const Response = await axiosInstance.get("/me/addresses");
  return unwrapData(Response) || [];
};

export const createMyAddress = async (Payload) => {
  const Response = await axiosInstance.post("/me/addresses", Payload);
  return unwrapData(Response);
};

export const updateMyAddress = async (AddressId, Payload) => {
  const Response = await axiosInstance.put(`/me/addresses/${AddressId}`, Payload);
  return unwrapData(Response);
};

export const deleteMyAddress = async (AddressId) => {
  const Response = await axiosInstance.delete(`/me/addresses/${AddressId}`);
  return unwrapData(Response);
};

export const logoutUser = async () => {
  const RefreshToken = getStoredRefreshToken();

  try {
    if (RefreshToken) {
      await axiosInstance.post("/auth/logout", { RefreshToken });
    }
  } catch {
    // ponytail: ignore logout API failure, local session still cleared; add surfaced toast when logout reliability matters.
  }

  clearAuthSession();
};

export const forgotPassword = async (Email) => {
  try {
    const Response = await axiosInstance.post("/auth/forgot-password", { Email: Email.trim().toLowerCase() });
    return {
      IsSuccess: Response?.IsSuccess ?? true,
      Message: unwrapMessage(Response),
      Data: unwrapData(Response),
    };
  } catch (Error) {
    return {
      IsSuccess: false,
      Message: Error.message,
      Errors: Error.data?.errors || [],
    };
  }
};

export const loginWithFacebook = async (AccessToken, RememberMe = true) => {
  try {
    const Response = await axiosInstance.post("/auth/facebook", { AccessToken: AccessToken.trim() });
    const AuthData = unwrapData(Response);

    if (!AuthData?.AccessToken || !AuthData?.User) {
      return { IsSuccess: false, ErrorCode: "INVALID_RESPONSE", Message: unwrapMessage(Response) };
    }

    return toSessionPayload(AuthData, RememberMe);
  } catch (Error) {
    return {
      IsSuccess: false,
      ErrorCode: Error.status === 400 ? "FACEBOOK_NOT_READY" : "FACEBOOK_LOGIN_FAILED",
      Message: Error.message,
      Errors: Error.data?.errors || [],
    };
  }
};

export const loginWithGoogle = async (IdToken, RememberMe = true) => {
  try {
    const Response = await axiosInstance.post("/auth/google", { IdToken: IdToken.trim() });
    const AuthData = unwrapData(Response);

    if (!AuthData?.AccessToken || !AuthData?.User) {
      return { IsSuccess: false, ErrorCode: "INVALID_RESPONSE", Message: unwrapMessage(Response) };
    }

    return toSessionPayload(AuthData, RememberMe);
  } catch (Error) {
    return {
      IsSuccess: false,
      ErrorCode: Error.status === 400 ? "GOOGLE_NOT_READY" : "GOOGLE_LOGIN_FAILED",
      Message: Error.message,
      Errors: Error.data?.errors || [],
    };
  }
};
