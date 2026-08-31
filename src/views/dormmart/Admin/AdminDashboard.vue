<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải dashboard...</div>
    <div v-else class="admin-metrics"><article v-for="Item in Metrics" :key="Item.Label" :class="['dm-card', 'admin-metric', `admin-metric--${Item.Tone}`]"><span class="material-symbols-outlined">{{ Item.Icon }}</span><div class="admin-metric__label">{{ Item.Label }}</div><div class="admin-metric__value">{{ Item.Value }}</div></article></div>
    <article class="dm-card admin-panel"><div class="admin-panel__header"><h2>{{ Text.SectionsTitle }}</h2></div><div class="admin-section-grid"><router-link v-for="Item in Sections" :key="Item.RouteName" :to="{ name: Item.RouteName }" class="admin-section-card"><span class="material-symbols-outlined">{{ Item.Icon }}</span><div><h3>{{ Item.Title }}</h3><p>{{ Item.Description }}</p><strong>{{ Text.OpenSection }} →</strong></div></router-link></div></article>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { getAdminOrders, getExpenses, getFinanceSummary } from "@/services/adminService";
import { formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminDashboard;
const Summary = ref(null);
const Orders = ref([]);
const Expenses = ref([]);
const IsLoading = ref(false);
const ErrorMessage = ref("");

const Metrics = computed(() => [
  { Label: Text.Revenue, Value: formatCurrency(Summary.value?.ProductRevenue || 0), Icon: "payments", Tone: "primary" },
  { Label: Text.Profit, Value: formatCurrency(Summary.value?.GrossProfit || 0), Icon: "trending_up", Tone: "success" },
  { Label: Text.ActiveAccounts, Value: Expenses.value.length, Icon: "group", Tone: "primary" },
  { Label: Text.PendingOrders, Value: Orders.value.filter((Item) => !["Completed", "Cancelled", "Rejected"].includes(Item.Status)).length, Icon: "local_shipping", Tone: "warning" },
]);
const Sections = computed(() => [
  { Title: Text.FinanceTitle, Description: Text.FinanceDescription, Icon: "monitoring", RouteName: "adminFinance" },
  { Title: Text.AccountsTitle, Description: Text.AccountsDescription, Icon: "manage_accounts", RouteName: "adminAccounts" },
  { Title: Text.OrdersTitle, Description: Text.OrdersDescription, Icon: "inventory", RouteName: "adminOrders" },
  { Title: Text.SupportTitle, Description: Text.SupportDescription, Icon: "support_agent", RouteName: "adminSupport" },
]);

const loadDashboard = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [SummaryData, OrderData, ExpenseData] = await Promise.all([
      getFinanceSummary(),
      getAdminOrders(),
      getExpenses(),
    ]);
    Summary.value = SummaryData;
    Orders.value = OrderData;
    Expenses.value = ExpenseData;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(loadDashboard);
</script>

<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
