import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? null;

export const getAdminOrders = async () => {
  const Response = await axiosInstance.get("/admin/orders");
  return unwrapData(Response) || [];
};

export const getAdminOrderById = async (OrderId) => {
  const Response = await axiosInstance.get(`/admin/orders/${OrderId}`);
  return unwrapData(Response);
};

export const runAdminOrderAction = async (OrderId, Action, Note = "") => {
  const Response = await axiosInstance.post(`/admin/orders/${OrderId}/${Action}`, { Note });
  return unwrapData(Response);
};

export const getAdminPayments = async () => {
  const Response = await axiosInstance.get("/admin/payments");
  return unwrapData(Response) || [];
};

export const runAdminPaymentAction = async (PaymentId, Action, Payload = {}) => {
  const Response = await axiosInstance.post(`/admin/payments/${PaymentId}/${Action}`, Payload);
  return unwrapData(Response);
};

export const getAdminShipments = async () => {
  const Response = await axiosInstance.get("/admin/shipments");
  return unwrapData(Response) || [];
};

export const runAdminShipmentAction = async (ShipmentId, Action, Payload = {}) => {
  const Response = await axiosInstance.post(`/admin/shipments/${ShipmentId}/${Action}`, Payload);
  return unwrapData(Response);
};

export const getFinanceSummary = async (Params = {}) => {
  const Response = await axiosInstance.get("/admin/finance/summary", { params: Params });
  return unwrapData(Response);
};

export const getFinanceRevenue = async (Params = {}) => {
  const Response = await axiosInstance.get("/admin/finance/revenue", { params: Params });
  return unwrapData(Response) || [];
};

export const getFinanceProfit = async (Params = {}) => {
  const Response = await axiosInstance.get("/admin/finance/profit", { params: Params });
  return unwrapData(Response);
};

export const getExpenses = async (Params = {}) => {
  const Response = await axiosInstance.get("/admin/expenses", { params: Params });
  return unwrapData(Response) || [];
};

export const createExpense = async (Payload) => {
  const Response = await axiosInstance.post("/admin/expenses", Payload);
  return unwrapData(Response);
};

export const updateExpense = async (ExpenseId, Payload) => {
  const Response = await axiosInstance.put(`/admin/expenses/${ExpenseId}`, Payload);
  return unwrapData(Response);
};

export const deleteExpense = async (ExpenseId) => {
  const Response = await axiosInstance.delete(`/admin/expenses/${ExpenseId}`);
  return unwrapData(Response);
};

export const getAdminSupportTickets = async () => {
  const Response = await axiosInstance.get("/admin/support-tickets");
  return unwrapData(Response) || [];
};

export const getAdminSupportTicketById = async (TicketId) => {
  const Response = await axiosInstance.get(`/admin/support-tickets/${TicketId}`);
  return unwrapData(Response);
};

export const sendAdminSupportMessage = async (TicketId, Content) => {
  const Response = await axiosInstance.post(`/admin/support-tickets/${TicketId}/messages`, { Content });
  return unwrapData(Response);
};

export const resolveAdminSupportTicket = async (TicketId) => {
  const Response = await axiosInstance.post(`/admin/support-tickets/${TicketId}/resolve`);
  return unwrapData(Response);
};

export const closeAdminSupportTicket = async (TicketId) => {
  const Response = await axiosInstance.post(`/admin/support-tickets/${TicketId}/close`);
  return unwrapData(Response);
};

export const getAdminAccounts = async () => {
  const Response = await axiosInstance.get("/admin/accounts");
  return unwrapData(Response) || [];
};

export const lockAdminAccount = async (UserId) => {
  const Response = await axiosInstance.post(`/admin/accounts/${UserId}/lock`);
  return unwrapData(Response);
};

export const unlockAdminAccount = async (UserId) => {
  const Response = await axiosInstance.post(`/admin/accounts/${UserId}/unlock`);
  return unwrapData(Response);
};

export const deleteAdminAccount = async (UserId) => {
  const Response = await axiosInstance.delete(`/admin/accounts/${UserId}`);
  return unwrapData(Response);
};
