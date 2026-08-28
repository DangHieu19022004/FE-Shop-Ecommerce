import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getOrders = async () => {
  const Response = await axiosInstance.get("/orders");
  return unwrapData(Response) || [];
};

export const getOrderById = async (OrderId) => {
  const Response = await axiosInstance.get(`/orders/${OrderId}`);
  return unwrapData(Response);
};

export const cancelOrder = async (OrderId) => {
  const Response = await axiosInstance.post(`/orders/${OrderId}/cancel`);
  return unwrapData(Response);
};
