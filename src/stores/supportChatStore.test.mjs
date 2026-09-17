import assert from "node:assert/strict";
import test from "node:test";
import { loadSupportChatTicketMessages, sendSupportChatMessageToBackend } from "./supportChatTicket.js";

test("support chat creates backend ticket on first customer message, then appends later messages", async () => {
  const store = new Map();
  const Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };

  const calls = [];
  const api = {
    createSupportTicket: async (Payload) => {
      calls.push(["create", Payload]);
      return {
        SupportTicketId: "ticket-1",
        Messages: [{ SupportMessageId: "message-1", Content: Payload.Content }],
      };
    },
    sendSupportMessage: async (TicketId, Content) => {
      calls.push(["message", TicketId, Content]);
      return {
        SupportTicketId: TicketId,
        Messages: [{ SupportMessageId: "message-2", Content }],
      };
    },
  };

  await sendSupportChatMessageToBackend(" Cần hỗ trợ đơn hàng ", api, Storage);
  await sendSupportChatMessageToBackend("Gửi thêm thông tin", api, Storage);

  assert.deepEqual(calls, [
    ["create", { Subject: "Yêu cầu hỗ trợ từ chat", Content: "Cần hỗ trợ đơn hàng", OrderId: null }],
    ["message", "ticket-1", "Gửi thêm thông tin"],
  ]);
});

test("support chat loads backend ticket messages so admin replies appear for user", async () => {
  const store = new Map([["DORM_MART_SUPPORT_TICKET_ID", "ticket-1"]]);
  const Storage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };

  const Messages = await loadSupportChatTicketMessages({
    getSupportTicketById: async (TicketId) => ({
      SupportTicketId: TicketId,
      Messages: [
        { SupportMessageId: "customer-1", SenderType: 0, Content: "Cần hỗ trợ", CreateDate: "2026-09-16T16:21:59Z" },
        { SupportMessageId: "admin-1", SenderType: 1, Content: "Admin đã trả lời", CreateDate: "2026-09-16T16:23:00Z" },
      ],
    }),
  }, Storage);

  assert.deepEqual(Messages.map((MessageItem) => [MessageItem.SenderType, MessageItem.MessageContent]), [
    ["CUSTOMER", "Cần hỗ trợ"],
    ["ADMIN", "Admin đã trả lời"],
  ]);
});
