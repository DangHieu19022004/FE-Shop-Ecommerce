const makeStorage = () => {
  const Items = new Map();
  return {
    getItem: (Key) => Items.has(Key) ? Items.get(Key) : null,
    setItem: (Key, Value) => Items.set(Key, String(Value)),
    removeItem: (Key) => Items.delete(Key),
  };
};

const assert = (Condition, Message) => {
  if (!Condition) throw new Error(Message);
};

globalThis.localStorage = makeStorage();
globalThis.sessionStorage = makeStorage();

const {
  SESSION_STORAGE_KEY,
  getStoredSession,
  persistAuthSession,
} = await import("./authStorage.js");

persistAuthSession({
  AccessToken: "access-token",
  RefreshToken: "refresh-token",
  ExpiresAt: "2026-09-14T00:00:00Z",
  User: {
    UserId: "user-id",
    FullName: "Dorm Mart User",
    Email: "user@dormmart.test",
    PhoneNumber: "",
    Roles: ["User"],
    EmailVerified: true,
  },
  RememberMe: false,
});

globalThis.sessionStorage = makeStorage();

assert(
  localStorage.getItem(SESSION_STORAGE_KEY),
  "login session should be stored in localStorage so a new tab can read it"
);
assert(
  getStoredSession()?.Email === "user@dormmart.test",
  "new tab should read current login session"
);

console.log("authStorage self-check passed");
