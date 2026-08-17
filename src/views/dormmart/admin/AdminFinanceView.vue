<script setup>
import { computed, inject, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import AdminData from "@/data/adminData.json";

const Text = inject("i18nCommon").AdminFinance;
const Expenses = ref(structuredClone(AdminData.Finance.Expenses));
const RevenueByMonth = ref(structuredClone(AdminData.Finance.RevenueByMonth));
const ExpenseCategories = [
  { Value: "PRODUCT_CAPITAL", Label: "Tiền vốn nhập hàng" },
  { Value: "SERVER", Label: "Máy chủ" },
  { Value: "SHIPPING", Label: "Chi phí vận chuyển" },
  { Value: "DOMAIN", Label: "Tên miền" },
  { Value: "OTHER", Label: "Chi phí khác" }
];
const ExpenseForm = reactive({ CategoryCode: "SERVER", Description: "", Amount: "", ExpenseDate: new Date().toISOString().slice(0, 10) });
const CurrentRevenue = computed(() => RevenueByMonth.value.at(-1).Revenue);
const CurrentExpense = computed(() => Expenses.value.reduce((Total, Item) => Total + Item.Amount, 0));
const CurrentProfit = computed(() => CurrentRevenue.value - CurrentExpense.value);
const ProfitMargin = computed(() => CurrentRevenue.value ? (CurrentProfit.value / CurrentRevenue.value) * 100 : 0);
const ChartMaximum = computed(() => Math.max(...RevenueByMonth.value.flatMap((Item) => [Item.Revenue, Item.Expense])));
const formatCurrency = (Value) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Value);
const getCategoryLabel = (CategoryCode) => ExpenseCategories.find((Item) => Item.Value === CategoryCode)?.Label || CategoryCode;
const addExpense = () => {
  const Amount = Number(ExpenseForm.Amount);
  if (!ExpenseForm.Description.trim() || !Amount || Amount <= 0) return;
  Expenses.value.unshift({ ExpenseId: `EXP-${Date.now()}`, CategoryCode: ExpenseForm.CategoryCode, Description: ExpenseForm.Description.trim(), Amount, ExpenseDate: ExpenseForm.ExpenseDate });
  ExpenseForm.Description = "";
  ExpenseForm.Amount = "";
};
</script>

<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div class="admin-metrics">
      <article class="dm-card admin-metric"><span class="admin-metric__label">{{ Text.Revenue }}</span><div class="admin-metric__value">{{ formatCurrency(CurrentRevenue) }}</div></article>
      <article class="dm-card admin-metric admin-metric--expense"><span class="admin-metric__label">{{ Text.Expense }}</span><div class="admin-metric__value">{{ formatCurrency(CurrentExpense) }}</div></article>
      <article class="dm-card admin-metric admin-metric--profit"><span class="admin-metric__label">{{ Text.Profit }}</span><div class="admin-metric__value">{{ formatCurrency(CurrentProfit) }}</div></article>
      <article class="dm-card admin-metric"><span class="admin-metric__label">{{ Text.Margin }}</span><div class="admin-metric__value">{{ ProfitMargin.toFixed(1) }}%</div></article>
    </div>
    <div class="admin-finance-grid">
      <article class="dm-card admin-panel">
        <div class="admin-panel__header"><h2>{{ Text.ChartTitle }}</h2></div>
        <div class="admin-chart">
          <div v-for="Item in RevenueByMonth" :key="Item.Month" class="admin-chart__group">
            <div class="admin-chart__bar" :style="{ height: `${(Item.Revenue / ChartMaximum) * 100}%` }" :title="formatCurrency(Item.Revenue)"></div>
            <div class="admin-chart__bar admin-chart__bar--expense" :style="{ height: `${(Item.Expense / ChartMaximum) * 100}%` }" :title="formatCurrency(Item.Expense)"></div>
            <span class="admin-chart__label">{{ Item.Month }}</span>
          </div>
        </div>
        <div class="admin-chart__legend"><span>{{ Text.Revenue }}</span><span>{{ Text.Expense }}</span></div>
      </article>
      <article class="dm-card admin-panel">
        <div class="admin-panel__header"><h2>{{ Text.AddExpense }}</h2></div>
        <form class="admin-form" @submit.prevent="addExpense">
          <DMSelect v-model="ExpenseForm.CategoryCode" :data="ExpenseCategories" option-label="Label" track-by="Value" :label-text="Text.Category" :allow-empty="false" />
          <DMInput v-model="ExpenseForm.Description" :label="Text.Description" />
          <DMInput v-model="ExpenseForm.Amount" type="number" :label="Text.Amount" />
          <DMInput v-model="ExpenseForm.ExpenseDate" type="date" :label="Text.Date" />
          <DMButton native-type="submit" type="none" :is-tooltip="false" :message="Text.Save" class="admin-button" />
        </form>
      </article>
    </div>
    <article class="dm-card admin-panel">
      <div class="admin-panel__header"><h2>{{ Text.ExpenseHistory }}</h2></div>
      <div class="admin-table-wrap"><table class="dm-table"><thead><tr><th>Mã</th><th>Loại chi phí</th><th>Nội dung</th><th>Ngày</th><th>Số tiền</th></tr></thead><tbody><tr v-for="Item in Expenses" :key="Item.ExpenseId"><td>{{ Item.ExpenseId }}</td><td>{{ getCategoryLabel(Item.CategoryCode) }}</td><td>{{ Item.Description }}</td><td>{{ Item.ExpenseDate }}</td><td><strong>{{ formatCurrency(Item.Amount) }}</strong></td></tr></tbody></table></div>
    </article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
