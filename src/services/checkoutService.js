import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getActiveVouchers = async () => {
  const Response = await axiosInstance.get("/vouchers");
  return unwrapData(Response) || [];
};

export const getActiveFlashSales = async () => {
  const Response = await axiosInstance.get("/flash-sales");
  return unwrapData(Response) || [];
};

export const checkoutOrder = async (Payload) => {
  const Response = await axiosInstance.post("/checkout", Payload);
  return unwrapData(Response);
};
