<script setup>
import { computed, inject } from "vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminDashboard;
const Revenue = AdminData.Finance.RevenueByMonth.at(-1).Revenue;
const Expense = AdminData.Finance.Expenses.reduce((Total, Item) => Total + Item.Amount, 0);
const Metrics = computed(() => [
  { Label: Text.Revenue, Value: formatCurrency(Revenue), Icon: "payments", Tone: "primary" },
  { Label: Text.Profit, Value: formatCurrency(Revenue - Expense), Icon: "trending_up", Tone: "success" },
  { Label: Text.ActiveAccounts, Value: AdminData.Accounts.filter((Item) => Item.StatusCode === "ACTIVE").length, Icon: "group", Tone: "primary" },
  { Label: Text.PendingOrders, Value: AdminData.Orders.filter((Item) => !["DELIVERED", "CANCELLED"].includes(Item.StatusCode)).length, Icon: "local_shipping", Tone: "warning" }
]);
const Sections = computed(() => [
  { Title: Text.FinanceTitle, Description: Text.FinanceDescription, Icon: "monitoring", RouteName: "adminFinance" },
  { Title: Text.AccountsTitle, Description: Text.AccountsDescription, Icon: "manage_accounts", RouteName: "adminAccounts" },
  { Title: Text.OrdersTitle, Description: Text.OrdersDescription, Icon: "inventory", RouteName: "adminOrders" },
  { Title: Text.SupportTitle, Description: Text.SupportDescription, Icon: "support_agent", RouteName: "adminSupport" }
]);
function formatCurrency(Value) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Value); }
</script>
<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div class="admin-metrics"><article v-for="Item in Metrics" :key="Item.Label" :class="['dm-card', 'admin-metric', `admin-metric--${Item.Tone}`]"><span class="material-symbols-outlined">{{ Item.Icon }}</span><div class="admin-metric__label">{{ Item.Label }}</div><div class="admin-metric__value">{{ Item.Value }}</div></article></div>
    <article class="dm-card admin-panel"><div class="admin-panel__header"><h2>{{ Text.SectionsTitle }}</h2></div><div class="admin-section-grid"><router-link v-for="Item in Sections" :key="Item.RouteName" :to="{ name: Item.RouteName }" class="admin-section-card"><span class="material-symbols-outlined">{{ Item.Icon }}</span><div><h3>{{ Item.Title }}</h3><p>{{ Item.Description }}</p><strong>{{ Text.OpenSection }} →</strong></div></router-link></div></article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
