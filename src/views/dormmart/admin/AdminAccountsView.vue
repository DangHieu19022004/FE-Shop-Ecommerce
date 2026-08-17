<script setup>
import { computed, inject, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminAccounts;
const Accounts = ref(structuredClone(AdminData.Accounts));
const SearchValue = ref("");
const FilteredAccounts = computed(() => {
  const Keyword = SearchValue.value.trim().toLowerCase();
  return Keyword ? Accounts.value.filter((Item) => [Item.FullName, Item.Email, Item.Phone].some((Value) => Value.toLowerCase().includes(Keyword))) : Accounts.value;
});
const toggleAccount = (UserId) => {
  const Account = Accounts.value.find((Item) => Item.UserId === UserId);
  if (Account) Account.StatusCode = Account.StatusCode === "ACTIVE" ? "LOCKED" : "ACTIVE";
};
const deleteAccount = (UserId) => { Accounts.value = Accounts.value.filter((Item) => Item.UserId !== UserId); };
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div><DMInput v-model="SearchValue" class="admin-search" :placeholder="Text.SearchPlaceholder" /></header>
    <article class="dm-card admin-panel"><div class="admin-table-wrap"><table class="dm-table"><thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Số đơn</th><th>Ngày tạo</th><th>Trạng thái</th><th></th></tr></thead><tbody><tr v-for="Item in FilteredAccounts" :key="Item.UserId"><td><strong>{{ Item.FullName }}</strong><br><small>{{ Item.UserId }}</small></td><td>{{ Item.Email }}<br><small>{{ Item.Phone }}</small></td><td>{{ Item.OrderCount }}</td><td>{{ Item.CreatedAt }}</td><td><span :class="['admin-status', { 'admin-status--warning': Item.StatusCode === 'LOCKED' }]">{{ Item.StatusCode === 'ACTIVE' ? Text.Active : Text.Locked }}</span></td><td><div class="admin-table-actions"><DMButton type="none" :is-tooltip="false" :message="Item.StatusCode === 'ACTIVE' ? Text.Lock : Text.Unlock" class="admin-button" @click="toggleAccount(Item.UserId)"/><DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" @click="deleteAccount(Item.UserId)"/></div></td></tr></tbody></table></div></article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
