export const CHAT_TICKET_SUBJECT = "Yêu cầu hỗ trợ từ chat";
export const SUPPORT_TICKET_STORAGE_KEY = "DORM_MART_SUPPORT_TICKET_ID";

const toChatMessage = (MessageItem) => ({
  ChatMessageId: MessageItem.SupportMessageId,
  SenderType: Number(MessageItem.SenderType) === 1 || String(MessageItem.SenderType).includes("Admin") ? "ADMIN" : "CUSTOMER",
  MessageContent: MessageItem.Content,
  SentAt: MessageItem.CreateDate,
  IsRead: Number(MessageItem.SenderType) !== 1,
});

export const loadSupportChatTicketMessages = async (Api, Storage = localStorage) => {
  const TicketId = Storage.getItem(SUPPORT_TICKET_STORAGE_KEY);
  if (!TicketId) return [];

  const Ticket = await Api.getSupportTicketById(TicketId);
  return (Ticket?.Messages || []).map(toChatMessage);
};

export const sendSupportChatMessageToBackend = async (MessageContent, Api, Storage = localStorage) => {
  const NormalizedMessage = MessageContent.trim();
  if (!NormalizedMessage) return false;

  const TicketId = Storage.getItem(SUPPORT_TICKET_STORAGE_KEY);
  const Ticket = TicketId
    ? await Api.sendSupportMessage(TicketId, NormalizedMessage)
    : await Api.createSupportTicket({ Subject: CHAT_TICKET_SUBJECT, Content: NormalizedMessage, OrderId: null });

  if (Ticket?.SupportTicketId) {
    Storage.setItem(SUPPORT_TICKET_STORAGE_KEY, Ticket.SupportTicketId);
  }

  return Ticket || true;
};
