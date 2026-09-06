<script setup>
import { computed, inject, onMounted, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { deleteAdminAccount, getAdminAccounts, lockAdminAccount, unlockAdminAccount } from "@/services/adminService";
import { formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminAccounts;
const Accounts = ref([]);
const SearchValue = ref("");
const IsLoading = ref(false);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const PendingUserId = ref("");

const FilteredAccounts = computed(() => {
  const Keyword = SearchValue.value.trim().toLowerCase();
  return Keyword
    ? Accounts.value.filter((Item) => [Item.FullName, Item.Email, Item.Phone || ""].some((Value) => Value.toLowerCase().includes(Keyword)))
    : Accounts.value;
});

const loadAccounts = async () => {
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
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div><DMInput v-model="SearchValue" class="admin-search" :placeholder="Text.SearchPlaceholder" /></header>
    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải tài khoản...</div>
    <article class="dm-card admin-panel"><div class="admin-table-wrap"><table class="dm-table"><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Số đơn</th><th>Ngày tạo</th><th>Trạng thái</th><th></th></tr></thead><tbody><tr v-for="Item in FilteredAccounts" :key="Item.UserId"><td><strong>{{ Item.FullName }}</strong><br><small>{{ Item.UserId }}</small></td><td>{{ Item.Email }}<br><small>{{ Item.Phone || 'Chưa có số' }}</small></td><td>{{ Item.OrderCount }}</td><td>{{ formatDateTime(Item.CreatedAt) }}</td><td><DMBadge :type="Item.StatusCode === 'ACTIVE' ? 'success' : 'error'" dot>{{ Item.StatusCode === 'ACTIVE' ? Text.Active : Text.Locked }}</DMBadge></td><td><div class="admin-table-actions"><DMButton type="none" :is-tooltip="false" :message="Item.StatusCode === 'ACTIVE' ? Text.Lock : Text.Unlock" class="admin-button" :un-active="PendingUserId === Item.UserId" @click="toggleAccount(Item)"/><DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" :un-active="PendingUserId === Item.UserId" @click="deleteAccount(Item.UserId)"/></div></td></tr></tbody></table></div></article>
  </section>
</template>
<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>

<!-- ponytail: no pagination or confirm dialog; add when account volume or destructive-safety needs grow. -->
