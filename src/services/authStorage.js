export const ACCESS_TOKEN_STORAGE_KEY = "DORM_MART_ACCESS_TOKEN";
export const REFRESH_TOKEN_STORAGE_KEY = "DORM_MART_REFRESH_TOKEN";
export const SESSION_STORAGE_KEY = "DORM_MART_SESSION";
export const SESSION_PERSIST_STORAGE_KEY = "DORM_MART_SESSION_PERSIST";

const getStorage = (ShouldPersist) => (ShouldPersist ? localStorage : sessionStorage);

const clearKey = (Key) => {
  localStorage.removeItem(Key);
  sessionStorage.removeItem(Key);
};

export const persistAuthSession = ({ AccessToken, RefreshToken, ExpiresAt, User, RememberMe }) => {
  const Storage = getStorage(RememberMe);
  const SessionData = {
    AccessToken,
    RefreshToken,
    ExpiresAt,
    User,
  };

  clearAuthSession();
  Storage.setItem(ACCESS_TOKEN_STORAGE_KEY, AccessToken);
  Storage.setItem(REFRESH_TOKEN_STORAGE_KEY, RefreshToken);
  Storage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      UserId: User.UserId,
      FullName: User.FullName,
      Email: User.Email,
      Phone: User.PhoneNumber || "",
      Roles: User.Roles || [],
      EmailVerified: User.EmailVerified,
      AccessToken,
      RefreshToken,
      ExpiresAt,
    })
  );
  Storage.setItem(SESSION_PERSIST_STORAGE_KEY, RememberMe ? "local" : "session");
  return SessionData;
};

export const getStoredAccessToken = () =>
  localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || "";

export const getStoredRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) || "";

export const getStoredSession = () => {
  const StoredSession = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!StoredSession) return null;

  try {
    return JSON.parse(StoredSession);
  } catch {
    clearAuthSession();
    return null;
  }
};

export const clearAuthSession = () => {
  clearKey(ACCESS_TOKEN_STORAGE_KEY);
  clearKey(REFRESH_TOKEN_STORAGE_KEY);
  clearKey(SESSION_STORAGE_KEY);
  clearKey(SESSION_PERSIST_STORAGE_KEY);
};
