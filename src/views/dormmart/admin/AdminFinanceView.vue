<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import { createExpense, deleteExpense, getExpenses, getFinanceProfit, getFinanceRevenue, getFinanceSummary } from "@/services/adminService";
import { formatCurrency } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminFinance;
const Expenses = ref([]);
const RevenueByMonth = ref([]);
const Summary = ref(null);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const ExpenseCategories = [
  { Value: "PRODUCT_CAPITAL", Label: "Tiền vốn nhập hàng" },
  { Value: "SERVER", Label: "Máy chủ" },
  { Value: "SHIPPING", Label: "Chi phí vận chuyển" },
  { Value: "DOMAIN", Label: "Tên miền" },
  { Value: "OTHER", Label: "Chi phí khác" }
];
const ExpenseForm = reactive({ Category: "SERVER", Note: "", Amount: "", ExpenseDate: new Date().toISOString().slice(0, 10) });
const CurrentRevenue = computed(() => Summary.value?.ProductRevenue || 0);
const CurrentExpense = computed(() => Summary.value?.ExpenseAmount || 0);
const CurrentProfit = computed(() => Summary.value?.GrossProfit || 0);
const ProfitMargin = computed(() => Summary.value?.GrossMarginPercent || 0);
const ChartMaximum = computed(() => Math.max(1, ...RevenueByMonth.value.flatMap((Item) => [Item.ProductRevenue || 0, 0])));
const getCategoryLabel = (CategoryCode) => ExpenseCategories.find((Item) => Item.Value === CategoryCode)?.Label || CategoryCode;

const loadFinance = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [SummaryData, RevenueData, ProfitData, ExpenseData] = await Promise.all([
      getFinanceSummary(),
      getFinanceRevenue({ Bucket: "month" }),
      getFinanceProfit(),
      getExpenses(),
    ]);
    Summary.value = { ...SummaryData, GrossMarginPercent: ProfitData?.GrossMarginPercent || 0 };
    RevenueByMonth.value = RevenueData;
    Expenses.value = ExpenseData;
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const addExpense = async () => {
  const Amount = Number(ExpenseForm.Amount);
  if (!ExpenseForm.Note.trim() || !Amount || Amount <= 0) return;

  try {
    await createExpense({
      Category: ExpenseForm.Category,
      Note: ExpenseForm.Note.trim(),
      Amount,
      ExpenseDate: ExpenseForm.ExpenseDate,
    });
    ExpenseForm.Note = "";
    ExpenseForm.Amount = "";
    SuccessMessage.value = "Đã lưu khoản chi.";
    await loadFinance();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

const removeExpense = async (ExpenseId) => {
  try {
    await deleteExpense(ExpenseId);
    await loadFinance();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadFinance);
</script>

<template>
  <section class="admin-page">
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div></header>
    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải tài chính...</div>
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
          <div v-for="Item in RevenueByMonth" :key="Item.Period" class="admin-chart__group">
            <div class="admin-chart__bar" :style="{ height: `${((Item.ProductRevenue || 0) / ChartMaximum) * 100}%` }" :title="formatCurrency(Item.ProductRevenue || 0)"></div>
            <span class="admin-chart__label">{{ Item.Period }}</span>
          </div>
        </div>
        <div class="admin-chart__legend"><span>{{ Text.Revenue }}</span></div>
      </article>
      <article class="dm-card admin-panel">
        <div class="admin-panel__header"><h2>{{ Text.AddExpense }}</h2></div>
        <form class="admin-form" @submit.prevent="addExpense">
          <DMSelect v-model="ExpenseForm.Category" :data="ExpenseCategories" option-label="Label" track-by="Value" :label-text="Text.Category" :allow-empty="false" />
          <DMInput v-model="ExpenseForm.Note" :label="Text.Description" />
          <DMInput v-model="ExpenseForm.Amount" type="number" :label="Text.Amount" />
          <DMInput v-model="ExpenseForm.ExpenseDate" type="date" :label="Text.Date" />
          <DMButton native-type="submit" type="none" :is-tooltip="false" class="admin-button" icon-name="save" :message="Text.Save" />
        </form>
      </article>
    </div>
    <article class="dm-card admin-panel">
      <div class="admin-panel__header"><h2>{{ Text.ExpenseHistory }}</h2></div>
      <div class="admin-table-wrap"><table class="dm-table"><thead><tr><th>Mã</th><th>Loại chi phí</th><th>Nội dung</th><th>Ngày</th><th>Số tiền</th><th></th></tr></thead><tbody><tr v-for="Item in Expenses" :key="Item.ExpenseId"><td>{{ Item.ExpenseId }}</td><td>{{ getCategoryLabel(Item.Category) }}</td><td>{{ Item.Note }}</td><td>{{ Item.ExpenseDate?.slice(0, 10) }}</td><td><strong>{{ formatCurrency(Item.Amount) }}</strong></td><td><button type="button" class="dm-btn-ghost" @click="removeExpense(Item.ExpenseId)">Xóa</button></td></tr></tbody></table></div>
    </article>
  </section>
</template>
<style scoped src="@/assets/styles/screens/admin-operations.css"></style>
