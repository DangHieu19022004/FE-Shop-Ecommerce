import AuthData from "@/data/authData.json";

const USERS_STORAGE_KEY = "DORM_MART_USERS";
const SESSION_STORAGE_KEY = "DORM_MART_SESSION";

const getStoredUsers = () => {
  const StoredUsers = localStorage.getItem(USERS_STORAGE_KEY);
  return StoredUsers ? JSON.parse(StoredUsers) : AuthData.Users;
};

const hashPassword = async (Password) => {
  const PasswordBytes = new TextEncoder().encode(Password);
  const HashBuffer = await crypto.subtle.digest("SHA-256", PasswordBytes);
  return Array.from(new Uint8Array(HashBuffer))
    .map((ByteItem) => ByteItem.toString(16).padStart(2, "0"))
    .join("");
};

export const registerUser = async (RegisterPayload) => {
  const Users = getStoredUsers();
  const NormalizedEmail = RegisterPayload.Email.trim().toLowerCase();
  const NormalizedPhone = RegisterPayload.Phone.trim();
  const IsAccountExists = Users.some(
    (UserItem) => UserItem.Email === NormalizedEmail || UserItem.Phone === NormalizedPhone,
  );

  if (IsAccountExists) return { IsSuccess: false, ErrorCode: "ACCOUNT_EXISTS" };

  const NewUser = {
    UserId: crypto.randomUUID(),
    RoleId: 1,
    FullName: RegisterPayload.FullName.trim(),
    Email: NormalizedEmail,
    Phone: NormalizedPhone,
    PasswordHash: await hashPassword(RegisterPayload.Password),
    IsActive: true,
    CreatedAt: new Date().toISOString(),
  };

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([...Users, NewUser]));
  return { IsSuccess: true, UserId: NewUser.UserId };
};

export const loginUser = async (LoginPayload) => {
  const Users = getStoredUsers();
  const NormalizedAccount = LoginPayload.Account.trim().toLowerCase();
  const PasswordHash = await hashPassword(LoginPayload.Password);
  const User = Users.find(
    (UserItem) =>
      UserItem.IsActive &&
      (UserItem.Email === NormalizedAccount || UserItem.Phone === LoginPayload.Account.trim()) &&
      UserItem.PasswordHash === PasswordHash,
  );

  if (!User) return { IsSuccess: false, ErrorCode: "INVALID_CREDENTIALS" };

  const SessionData = {
    UserId: User.UserId,
    FullName: User.FullName,
    Email: User.Email,
    RoleId: User.RoleId,
    CreatedAt: new Date().toISOString(),
  };
  const Storage = LoginPayload.RememberMe ? localStorage : sessionStorage;
  Storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(SessionData));
  return { IsSuccess: true, SessionData };
};
