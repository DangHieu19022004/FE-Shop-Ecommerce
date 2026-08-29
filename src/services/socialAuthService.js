import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const FACEBOOK_SDK_SRC = "https://connect.facebook.net/en_US/sdk.js";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID?.trim() || "";

const FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || "",
};

let FacebookSdkPromise = null;

const loadScriptOnce = (Source, ScriptId) => new Promise((Resolve, Reject) => {
  const ExistingScript = document.getElementById(ScriptId);
  if (ExistingScript) {
    if (ExistingScript.dataset.loaded === "true") {
      Resolve();
      return;
    }

    ExistingScript.addEventListener("load", () => Resolve(), { once: true });
    ExistingScript.addEventListener("error", () => Reject(new Error("Không thể tải SDK đăng nhập.")), { once: true });
    return;
  }

  const Script = document.createElement("script");
  Script.id = ScriptId;
  Script.src = Source;
  Script.async = true;
  Script.defer = true;
  Script.addEventListener("load", () => {
    Script.dataset.loaded = "true";
    Resolve();
  }, { once: true });
  Script.addEventListener("error", () => Reject(new Error("Không thể tải SDK đăng nhập.")), { once: true });
  document.head.appendChild(Script);
});

const hasFirebaseGoogleConfig = () => Boolean(
  FirebaseConfig.apiKey
  && FirebaseConfig.authDomain
  && FirebaseConfig.projectId
  && FirebaseConfig.appId
  && GOOGLE_CLIENT_ID
);

const getFirebaseApp = () => {
  if (!hasFirebaseGoogleConfig()) {
    throw new Error("Google login chưa được cấu hình trên frontend.");
  }

  return getApps().length ? getApp() : initializeApp(FirebaseConfig);
};

const ensureFacebookSdk = async () => {
  if (!FACEBOOK_APP_ID) {
    throw new Error("Facebook login chưa được cấu hình trên frontend.");
  }

  if (!FacebookSdkPromise) {
    FacebookSdkPromise = loadScriptOnce(FACEBOOK_SDK_SRC, "facebook-jssdk").then(() => new Promise((Resolve, Reject) => {
      if (!window.FB?.init) {
        Reject(new Error("Facebook login chưa sẵn sàng trên trình duyệt này."));
        return;
      }

      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: false,
        xfbml: false,
        version: "v23.0",
      });

      Resolve(window.FB);
    }));
  }

  return FacebookSdkPromise;
};

export const signInWithGoogle = async () => {
  const FirebaseApp = getFirebaseApp();
  const Auth = getAuth(FirebaseApp);
  const Provider = new GoogleAuthProvider();
  Provider.setCustomParameters({ prompt: "select_account" });

  try {
    const Result = await signInWithPopup(Auth, Provider);
    const IdToken = await Result.user.getIdToken();
    await Auth.signOut();

    if (!IdToken) {
      throw new Error("Không lấy được Google ID token.");
    }

    return IdToken;
  } catch (Error) {
    if (Error?.code === "auth/popup-closed-by-user" || Error?.code === "auth/cancelled-popup-request") {
      throw new Error("Đăng nhập Google bị hủy hoặc thất bại.");
    }

    if (Error?.code === "auth/popup-blocked") {
      throw new Error("Trình duyệt đã chặn popup đăng nhập Google.");
    }

    if (Error?.code === "auth/unauthorized-domain") {
      throw new Error("Domain hiện tại chưa được cho phép trong Firebase Authentication.");
    }

    throw new Error(Error?.message || "Đăng nhập Google thất bại.");
  }
};

export const signInWithFacebook = async () => {
  const FacebookSdk = await ensureFacebookSdk();

  return new Promise((Resolve, Reject) => {
    FacebookSdk.login((Response) => {
      if (!Response?.authResponse?.accessToken) {
        Reject(new Error(Response?.status === "not_authorized"
          ? "Tài khoản Facebook chưa cấp quyền email."
          : "Đăng nhập Facebook bị hủy hoặc thất bại."));
        return;
      }

      Resolve(Response.authResponse.accessToken);
    }, {
      scope: "public_profile,email",
      return_scopes: true,
      auth_type: "rerequest",
    });
  });
};

export const hasGoogleLoginConfig = () => hasFirebaseGoogleConfig();
export const hasFacebookLoginConfig = () => Boolean(FACEBOOK_APP_ID);
