import axiosInstance from "@/services/axios";

const unwrapData = (Response) => Response?.Data ?? Response?.data ?? Response?.Items ?? Response?.items ?? Response ?? null;
const unwrapList = (Response) => {
  const Data = unwrapData(Response);
  return Array.isArray(Data) ? Data : (Array.isArray(Data?.Items) ? Data.Items : (Array.isArray(Data?.items) ? Data.items : []));
};

export const getAdminInventories = async (Params = {}) => {
  const Response = await axiosInstance.get("/admin/inventories", { params: Params });
  return unwrapData(Response);
};

export const getAdminInventoryTransactions = async (VariantId) => {
  const Response = await axiosInstance.get(`/admin/inventories/${VariantId}/transactions`);
  return unwrapData(Response) || [];
};

export const importAdminInventory = async (VariantId, Payload) => {
  const Response = await axiosInstance.post(`/admin/inventories/${VariantId}/import`, Payload);
  return unwrapData(Response);
};

export const adjustAdminInventory = async (VariantId, Payload) => {
  const Response = await axiosInstance.post(`/admin/inventories/${VariantId}/adjust`, Payload);
  return unwrapData(Response);
};

export const getAdminVouchers = async () => {
  const Response = await axiosInstance.get("/admin/vouchers");
  return unwrapList(Response);
};

export const createAdminVoucher = async (Payload) => {
  const Response = await axiosInstance.post("/admin/vouchers", Payload);
  return unwrapData(Response);
};

export const updateAdminVoucher = async (VoucherId, Payload) => {
  const Response = await axiosInstance.put(`/admin/vouchers/${VoucherId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminVoucher = async (VoucherId) => {
  const Response = await axiosInstance.delete(`/admin/vouchers/${VoucherId}`);
  return unwrapData(Response);
};

export const createAdminCategory = async (Payload) => {
  const Response = await axiosInstance.post("/admin/categories", Payload);
  return unwrapData(Response);
};

export const updateAdminCategory = async (CategoryId, Payload) => {
  const Response = await axiosInstance.put(`/admin/categories/${CategoryId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminCategory = async (CategoryId) => {
  const Response = await axiosInstance.delete(`/admin/categories/${CategoryId}`);
  return unwrapData(Response);
};

export const createAdminBrand = async (Payload) => {
  const Response = await axiosInstance.post("/admin/brands", Payload);
  return unwrapData(Response);
};

export const updateAdminBrand = async (BrandId, Payload) => {
  const Response = await axiosInstance.put(`/admin/brands/${BrandId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminBrand = async (BrandId) => {
  const Response = await axiosInstance.delete(`/admin/brands/${BrandId}`);
  return unwrapData(Response);
};

export const getAdminProducts = async (Params = {}) => {
  const Response = await axiosInstance.get("/admin/products", { params: Params });
  return unwrapData(Response);
};

export const getAdminProductById = async (ProductId) => {
  const Response = await axiosInstance.get(`/admin/products/${ProductId}`);
  return unwrapData(Response);
};

export const createAdminProduct = async (Payload) => {
  const Response = await axiosInstance.post("/admin/products", Payload);
  return unwrapData(Response);
};

export const updateAdminProduct = async (ProductId, Payload) => {
  const Response = await axiosInstance.put(`/admin/products/${ProductId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminProduct = async (ProductId) => {
  const Response = await axiosInstance.delete(`/admin/products/${ProductId}`);
  return unwrapData(Response);
};

export const getAdminCombos = async () => {
  const Response = await axiosInstance.get("/admin/combos");
  return unwrapData(Response) || [];
};

export const getAdminComboById = async (ComboId) => {
  const Response = await axiosInstance.get(`/admin/combos/${ComboId}`);
  return unwrapData(Response);
};

export const createAdminCombo = async (Payload) => {
  const Response = await axiosInstance.post("/admin/combos", Payload);
  return unwrapData(Response);
};

export const updateAdminCombo = async (ComboId, Payload) => {
  const Response = await axiosInstance.put(`/admin/combos/${ComboId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminCombo = async (ComboId) => {
  const Response = await axiosInstance.delete(`/admin/combos/${ComboId}`);
  return unwrapData(Response);
};

export const createAdminComboDiscount = async (ComboId, Payload) => {
  const Response = await axiosInstance.post(`/admin/combos/${ComboId}/discounts`, Payload);
  return unwrapData(Response);
};

export const updateAdminComboDiscount = async (ComboId, DiscountId, Payload) => {
  const Response = await axiosInstance.put(`/admin/combos/${ComboId}/discounts/${DiscountId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminComboDiscount = async (ComboId, DiscountId) => {
  const Response = await axiosInstance.delete(`/admin/combos/${ComboId}/discounts/${DiscountId}`);
  return unwrapData(Response);
};

export const getAdminFlashSales = async () => {
  const Response = await axiosInstance.get("/admin/flash-sales");
  return unwrapList(Response);
};

export const createAdminFlashSale = async (Payload) => {
  const Response = await axiosInstance.post("/admin/flash-sales", Payload);
  return unwrapData(Response);
};

export const updateAdminFlashSale = async (FlashSaleId, Payload) => {
  const Response = await axiosInstance.put(`/admin/flash-sales/${FlashSaleId}`, Payload);
  return unwrapData(Response);
};

export const deleteAdminFlashSale = async (FlashSaleId) => {
  const Response = await axiosInstance.delete(`/admin/flash-sales/${FlashSaleId}`);
  return unwrapData(Response);
};

export const addAdminFlashSaleItem = async (FlashSaleId, Payload) => {
  const Response = await axiosInstance.post(`/admin/flash-sales/${FlashSaleId}/items`, Payload);
  return unwrapData(Response);
};

export const deleteAdminFlashSaleItem = async (FlashSaleId, FlashSaleItemId) => {
  const Response = await axiosInstance.delete(`/admin/flash-sales/${FlashSaleId}/items/${FlashSaleItemId}`);
  return unwrapData(Response);
};

export const getShippingQuote = async (Payload) => {
  const Response = await axiosInstance.post("/shipping/quote", Payload);
  return unwrapData(Response);
};

export const uploadPaymentProof = async (PaymentId, File) => {
  const FormDataPayload = new FormData();
  FormDataPayload.append("file", File);
  const Response = await axiosInstance.post(`/payments/${PaymentId}/proofs`, FormDataPayload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrapData(Response);
};

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

export const deleteAdminOrder = async (OrderId) => {
  const Response = await axiosInstance.delete(`/admin/orders/${OrderId}`);
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
