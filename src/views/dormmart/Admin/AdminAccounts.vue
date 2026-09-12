<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { deleteAdminAccount, getAdminAccounts, lockAdminAccount, unlockAdminAccount } from "@/services/adminService";
import { confirmDelete } from "@/stores/confirmStore";
import { formatDateTime } from "@/utils/shopFormatters";
import { useRoute } from "vue-router";

const Text = inject("i18nCommon").AdminAccounts;
const Accounts = ref([]);
const Route = useRoute();
const SearchValue = ref(String(Route.query.Search || ""));
const IsLoading = ref(false);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const PendingUserId = ref("");
const StatusFilter = ref("all");
const Page = ref(1);
const PageSize = 12;

const FilteredAccounts = computed(() => {
  const Keyword = SearchValue.value.trim().toLowerCase();
  return Accounts.value.filter((Item) =>
    (StatusFilter.value === "all" || Item.StatusCode === StatusFilter.value)
    && (!Keyword || [Item.FullName, Item.Email, Item.Phone, Item.UserId].some((Value) => String(Value ?? "").toLowerCase().includes(Keyword))));
});
const PageCount = computed(() => Math.max(1, Math.ceil(FilteredAccounts.value.length / PageSize)));
const VisibleAccounts = computed(() => FilteredAccounts.value.slice((Page.value - 1) * PageSize, Page.value * PageSize));
watch([SearchValue, StatusFilter], () => { Page.value = 1; });
watch(() => Route.query.Search, (Value) => { SearchValue.value = String(Value || ""); });
watch(PageCount, (Count) => { Page.value = Math.min(Page.value, Count); });
const accountDate = (Value) => Value && Number.isFinite(Date.parse(Value)) ? formatDateTime(Value) : "—";

const loadAccounts = async () => {
  if (IsLoading.value) return;
  try {
    IsLoading.value = true;
    ErrorMessage.value = "";
    Accounts.value = await getAdminAccounts();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const toggleAccount = async (Item) => {
  try {
    PendingUserId.value = Item.UserId;
    ErrorMessage.value = "";
    SuccessMessage.value = "";
    if (Item.StatusCode === "ACTIVE") {
      await lockAdminAccount(Item.UserId);
      SuccessMessage.value = "Đã khóa tài khoản.";
    } else {
      await unlockAdminAccount(Item.UserId);
      SuccessMessage.value = "Đã mở khóa tài khoản.";
    }
    await loadAccounts();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    PendingUserId.value = "";
  }
};

const deleteAccount = async (UserId) => {
  if (!await confirmDelete("Xóa tài khoản này? Dữ liệu liên quan có thể không khôi phục được.")) return;

  try {
    PendingUserId.value = UserId;
    ErrorMessage.value = "";
    SuccessMessage.value = "";
    await deleteAdminAccount(UserId);
    SuccessMessage.value = "Đã xóa tài khoản.";
    await loadAccounts();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    PendingUserId.value = "";
  }
};

onMounted(loadAccounts);
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div><button class="admin-accounts-control" :disabled="IsLoading" @click="loadAccounts">Tải lại dữ liệu</button></header>
    <div v-if="ErrorMessage" role="alert" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải tài khoản...</div>
    <article v-if="!IsLoading && !ErrorMessage" class="dm-card admin-panel">
      <div class="admin-accounts-toolbar"><label class="admin-accounts-search">Tìm tài khoản<DMInput v-model="SearchValue" :placeholder="Text.SearchPlaceholder" /></label><label>Trạng thái<select v-model="StatusFilter" class="admin-accounts-control"><option value="all">Tất cả trạng thái</option><option value="ACTIVE">Đang hoạt động</option><option value="LOCKED">Đã khóa</option></select></label><span>{{ FilteredAccounts.length }} kết quả / {{ Accounts.length }} tài khoản</span></div>
      <div v-if="!FilteredAccounts.length" class="admin-accounts-empty" role="status"><h2>{{ Accounts.length ? 'Không tìm thấy tài khoản' : 'Chưa có tài khoản' }}</h2><p>{{ Accounts.length ? 'Thử tìm theo tên, email, số điện thoại hoặc đổi bộ lọc.' : 'Các tài khoản sẽ xuất hiện tại đây khi có dữ liệu.' }}</p></div>
      <template v-else>
        <div class="admin-table-wrap"><table class="dm-table admin-accounts-table"><thead><tr><th scope="col">Khách hàng</th><th scope="col">Liên hệ</th><th scope="col">Số đơn</th><th scope="col">Ngày tạo</th><th scope="col">Trạng thái</th><th scope="col">Thao tác</th></tr></thead><tbody><tr v-for="Item in VisibleAccounts" :key="Item.UserId"><td><strong>{{ Item.FullName || 'Chưa có tên' }}</strong><small class="admin-accounts-id">{{ Item.UserId }}</small></td><td>{{ Item.Email || 'Chưa có email' }}<br><small>{{ Item.Phone || 'Chưa có số điện thoại' }}</small></td><td>{{ Item.OrderCount ?? '—' }}</td><td>{{ accountDate(Item.CreatedAt) }}</td><td><DMBadge :type="Item.StatusCode === 'ACTIVE' ? 'success' : 'error'" dot>{{ Item.StatusCode === 'ACTIVE' ? Text.Active : Item.StatusCode === 'LOCKED' ? Text.Locked : (Item.StatusCode || 'Chưa xác định') }}</DMBadge></td><td><div class="admin-table-actions"><DMButton v-if="['ACTIVE', 'LOCKED'].includes(Item.StatusCode)" type="none" :is-tooltip="false" :message="Item.StatusCode === 'ACTIVE' ? Text.Lock : Text.Unlock" class="admin-button" :un-active="!!PendingUserId" @click="toggleAccount(Item)"/><DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" :un-active="!!PendingUserId" @click="deleteAccount(Item.UserId)"/></div></td></tr></tbody></table></div>
        <nav class="admin-accounts-pagination" aria-label="Phân trang tài khoản"><span>Trang {{ Page }} / {{ PageCount }}</span><div><button class="admin-accounts-control" :disabled="Page <= 1" @click="Page--">Trang trước</button><button class="admin-accounts-control" :disabled="Page >= PageCount" @click="Page++">Trang sau</button></div></nav>
      </template>
    </article>
  </section>
</template>
<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>

<style scoped>
.admin-accounts-toolbar { display: flex; flex-wrap: wrap; align-items: end; gap: 16px; margin-bottom: 22px; }
.admin-accounts-toolbar label { display: grid; gap: 8px; font-size: 13px; font-weight: 600; }
.admin-accounts-search { flex: 1; min-width: min(100%, 240px); }
.admin-accounts-toolbar > span { padding-bottom: 12px; font-size: 12px; color: var(--dm-text-soft); }
.admin-accounts-control { min-height: 42px; padding: 9px 14px; border: 1px solid var(--dm-border); border-radius: 10px; color: var(--dm-text); background: var(--dm-surface); font: inherit; }
button.admin-accounts-control { cursor: pointer; }
.admin-accounts-control:disabled { opacity: .45; cursor: default; }
.admin-accounts-control:focus-visible { outline: 3px solid var(--dm-primary); outline-offset: 2px; }
.admin-accounts-empty { padding: 40px 16px; text-align: center; color: var(--dm-text-soft); }
.admin-accounts-empty h2 { color: var(--dm-text); font-size: 20px; }
.admin-accounts-table { min-width: 780px; }
.admin-accounts-table td { overflow-wrap: anywhere; }
.admin-accounts-id { display: block; margin-top: 6px; max-width: 200px; color: var(--dm-text-soft); font-size: 11px; }
.admin-accounts-pagination { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; margin-top: 18px; color: var(--dm-text-soft); font-size: 13px; }
.admin-accounts-pagination > div { display: flex; gap: 8px; }
</style>
