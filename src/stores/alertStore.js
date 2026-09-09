import { readonly, ref } from "vue";

export const DEFAULT_ALERT_DURATION = 3000;

const AlertItems = ref([]);
const AlertTimers = new Map();
let AlertSequence = 0;

const AlertTitles = {
  success: "Thành công",
  danger: "Có lỗi xảy ra",
  warning: "Cảnh báo",
};

const normalizeType = (Type) => {
  if (Type === "error") return "danger";
  return Object.hasOwn(AlertTitles, Type) ? Type : "warning";
};

const normalizeDuration = (Duration) => {
  const NumericDuration = Number(Duration);
  return Number.isFinite(NumericDuration) && NumericDuration >= 0
    ? NumericDuration
    : DEFAULT_ALERT_DURATION;
};

export const dismissAlert = (AlertId) => {
  const Timer = AlertTimers.get(AlertId);
  if (Timer) {
    window.clearTimeout(Timer);
    AlertTimers.delete(AlertId);
  }

  AlertItems.value = AlertItems.value.filter((AlertItem) => AlertItem.Id !== AlertId);
};

export const showAlert = (MessageOrOptions, Type = "warning", Duration = DEFAULT_ALERT_DURATION) => {
  const Options = typeof MessageOrOptions === "object" && MessageOrOptions !== null
    ? MessageOrOptions
    : { Message: MessageOrOptions, Type, Duration };
  const ResolvedType = normalizeType(Options.Type ?? Options.type ?? Type);
  const ResolvedDuration = normalizeDuration(Options.Duration ?? Options.duration ?? Duration);
  const AlertId = `dm-alert-${Date.now()}-${++AlertSequence}`;
  const AlertItem = {
    Id: AlertId,
    Type: ResolvedType,
    Title: Options.Title || Options.title || AlertTitles[ResolvedType],
    Message: String(Options.Message ?? Options.message ?? ""),
    Duration: ResolvedDuration,
  };

  AlertItems.value = [AlertItem, ...AlertItems.value];

  if (ResolvedDuration > 0) {
    AlertTimers.set(AlertId, window.setTimeout(() => dismissAlert(AlertId), ResolvedDuration));
  }

  return AlertId;
};

export const showSuccess = (Message, Options = {}) => showAlert({ ...Options, Message, Type: "success" });
export const showDanger = (Message, Options = {}) => showAlert({ ...Options, Message, Type: "danger" });
export const showWarning = (Message, Options = {}) => showAlert({ ...Options, Message, Type: "warning" });

export const clearAlerts = () => {
  AlertTimers.forEach((Timer) => window.clearTimeout(Timer));
  AlertTimers.clear();
  AlertItems.value = [];
};

export const Alerts = readonly(AlertItems);
