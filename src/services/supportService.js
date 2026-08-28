import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getSupportTickets = async () => {
  const Response = await axiosInstance.get("/support-tickets");
  return unwrapData(Response) || [];
};

export const getSupportTicketById = async (TicketId) => {
  const Response = await axiosInstance.get(`/support-tickets/${TicketId}`);
  return unwrapData(Response);
};

export const createSupportTicket = async (Payload) => {
  const Response = await axiosInstance.post("/support-tickets", Payload);
  return unwrapData(Response);
};

export const sendSupportMessage = async (TicketId, Content) => {
  const Response = await axiosInstance.post(`/support-tickets/${TicketId}/messages`, { Content });
  return unwrapData(Response);
};
