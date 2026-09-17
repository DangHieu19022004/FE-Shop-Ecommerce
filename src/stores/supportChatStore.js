import { computed, ref, watch } from "vue";
import { createSupportTicket, getSupportTicketById, sendSupportMessage } from "@/services/supportService";
import { loadSupportChatTicketMessages, sendSupportChatMessageToBackend } from "@/stores/supportChatTicket";

const CHAT_STORAGE_KEY = "DORM_MART_SUPPORT_CHAT";
const StoredMessages = localStorage.getItem(CHAT_STORAGE_KEY);
export const ChatMessages = ref(StoredMessages ? JSON.parse(StoredMessages) : []);
export const IsChatOpen = ref(false);
export const IsAdminTyping = ref(false);
export const UnreadMessageCount = computed(() => ChatMessages.value.filter((MessageItem) => MessageItem.SenderType === "ADMIN" && !MessageItem.IsRead).length);

const SupportApi = { createSupportTicket, getSupportTicketById, sendSupportMessage };

export const refreshChatMessages = async () => {
  const Messages = await loadSupportChatTicketMessages(SupportApi);
  if (Messages.length) {
    ChatMessages.value = Messages;
  }
};

export const markMessagesAsRead = () => ChatMessages.value.forEach((MessageItem) => { if (MessageItem.SenderType === "ADMIN") MessageItem.IsRead = true; });
export const toggleChat = async () => { IsChatOpen.value = !IsChatOpen.value; if (IsChatOpen.value) { await refreshChatMessages(); markMessagesAsRead(); } };

export const sendChatMessage = async (MessageContent) => {
  const NormalizedMessage = MessageContent.trim();
  if (!NormalizedMessage) return false;

  await sendSupportChatMessageToBackend(NormalizedMessage, SupportApi);
  ChatMessages.value.push({ ChatMessageId: crypto.randomUUID(), SupportAgentId: null, SenderType: "CUSTOMER", MessageContent: NormalizedMessage, SentAt: new Date().toISOString(), IsRead: true });
  return true;
};
watch(ChatMessages, (CurrentMessages) => localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(CurrentMessages)), { deep: true });
