import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const checkoutOrder = async (Payload) => {
  const Response = await axiosInstance.post("/checkout", Payload);
  return unwrapData(Response);
};
