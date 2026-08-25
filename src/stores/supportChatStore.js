import { computed, ref, watch } from "vue";
import SupportChatData from "@/data/supportChatData.json";

const CHAT_STORAGE_KEY = "DORM_MART_SUPPORT_CHAT";
const StoredMessages = localStorage.getItem(CHAT_STORAGE_KEY);
export const ChatMessages = ref(StoredMessages ? JSON.parse(StoredMessages) : SupportChatData.ChatMessages);
export const IsChatOpen = ref(false);
export const IsAdminTyping = ref(false);
export const UnreadMessageCount = computed(() => ChatMessages.value.filter((MessageItem) => MessageItem.SenderType === "ADMIN" && !MessageItem.IsRead).length);

export const markMessagesAsRead = () => ChatMessages.value.forEach((MessageItem) => { if (MessageItem.SenderType === "ADMIN") MessageItem.IsRead = true; });
export const toggleChat = () => { IsChatOpen.value = !IsChatOpen.value; if (IsChatOpen.value) markMessagesAsRead(); };
export const sendChatMessage = (MessageContent, AutoReplyText) => {
  const NormalizedMessage = MessageContent.trim();
  if (!NormalizedMessage) return false;
  ChatMessages.value.push({ ChatMessageId: crypto.randomUUID(), SupportAgentId: null, SenderType: "CUSTOMER", MessageContent: NormalizedMessage, SentAt: new Date().toISOString(), IsRead: true });
  IsAdminTyping.value = true;
  setTimeout(() => {
    ChatMessages.value.push({ ChatMessageId: crypto.randomUUID(), SupportAgentId: 1, SenderType: "ADMIN", MessageContent: AutoReplyText, SentAt: new Date().toISOString(), IsRead: IsChatOpen.value });
    IsAdminTyping.value = false;
  }, 900);
  return true;
};
watch(ChatMessages, (CurrentMessages) => localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(CurrentMessages)), { deep: true });
