import { readonly, ref } from "vue";

const InitialConfirmState = {
  IsOpen: false,
  Title: "Xác nhận thao tác",
  Message: "Bạn có chắc chắn muốn tiếp tục?",
  ConfirmText: "Xác nhận",
  CancelText: "Quay lại",
  Type: "danger",
};

const ConfirmState = ref({ ...InitialConfirmState });
let ResolveConfirmation = null;

const closeConfirmation = (Result) => {
  if (!ConfirmState.value.IsOpen) return;
  ConfirmState.value = { ...ConfirmState.value, IsOpen: false };
  const Resolve = ResolveConfirmation;
  ResolveConfirmation = null;
  Resolve?.(Result);
};

export const confirmAction = (MessageOrOptions = {}) => {
  const Options = typeof MessageOrOptions === "string"
    ? { Message: MessageOrOptions }
    : MessageOrOptions;

  if (ConfirmState.value.IsOpen) {
    closeConfirmation(false);
  }

  ConfirmState.value = {
    IsOpen: true,
    Title: Options.Title || Options.title || InitialConfirmState.Title,
    Message: Options.Message || Options.message || InitialConfirmState.Message,
    ConfirmText: Options.ConfirmText || Options.confirmText || InitialConfirmState.ConfirmText,
    CancelText: Options.CancelText || Options.cancelText || InitialConfirmState.CancelText,
    Type: Options.Type || Options.type || InitialConfirmState.Type,
  };

  return new Promise((Resolve) => {
    ResolveConfirmation = Resolve;
  });
};

export const confirmDelete = (Message, Options = {}) => confirmAction({
  Title: "Xác nhận xóa",
  ConfirmText: "Xóa",
  ...Options,
  Message,
  Type: "danger",
});

export const acceptConfirmation = () => closeConfirmation(true);
export const cancelConfirmation = () => closeConfirmation(false);
export const Confirmation = readonly(ConfirmState);

