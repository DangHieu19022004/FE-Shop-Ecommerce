import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getProductReviews = async (ProductId) => {
  const Response = await axiosInstance.get(`/reviews/${ProductId}`);
  return unwrapData(Response);
};

export const getMyReviews = async () => {
  const Response = await axiosInstance.get("/reviews/my");
  return unwrapData(Response) || [];
};

export const createReview = async (Payload) => {
  const Response = await axiosInstance.post("/reviews", Payload);
  return unwrapData(Response);
};

export const getAdminReviews = async (Status = "") => {
  const Response = await axiosInstance.get("/admin/reviews", { params: Status === "" ? {} : { Status } });
  return unwrapData(Response) || [];
};

export const approveReview = async (ReviewId) => {
  const Response = await axiosInstance.post(`/admin/reviews/${ReviewId}/approve`);
  return unwrapData(Response);
};

export const rejectReview = async (ReviewId, Note = "") => {
  const Response = await axiosInstance.post(`/admin/reviews/${ReviewId}/reject`, { Note });
  return unwrapData(Response);
};

export const getLoyaltyBalance = async () => {
  const Response = await axiosInstance.get("/loyalty/balance");
  return unwrapData(Response);
};

export const getLoyaltyHistory = async () => {
  const Response = await axiosInstance.get("/loyalty/history");
  return unwrapData(Response) || [];
};

export const getNotifications = async () => {
  const Response = await axiosInstance.get("/notifications");
  return unwrapData(Response) || [];
};

export const getUnreadNotificationCount = async () => {
  const Response = await axiosInstance.get("/notifications/unread-count");
  return unwrapData(Response)?.UnreadCount || 0;
};

export const markNotificationRead = async (NotificationId) => {
  const Response = await axiosInstance.post(`/notifications/${NotificationId}/read`);
  return unwrapData(Response);
};

export const loginWithFacebookToken = async (AccessToken) => {
  const Response = await axiosInstance.post("/auth/facebook", { AccessToken });
  return unwrapData(Response);
};
