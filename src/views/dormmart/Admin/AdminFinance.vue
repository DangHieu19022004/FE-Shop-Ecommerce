<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import DMSelect from "@/components/base/DMSelect.vue";
import { createExpense, deleteExpense, getExpenses, getFinanceProfit, getFinanceRevenue, getFinanceSummary } from "@/services/adminService";
import { confirmDelete } from "@/stores/confirmStore";
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
const FinanceBreakdown = computed(() => [
  { Label: "Giá vốn hàng bán", Value: Summary.value?.CostOfGoodsSold, Currency: true },
  { Label: "Phí vận chuyển cửa hàng", Value: Summary.value?.StoreShippingFee, Currency: true },
  { Label: "Phí thanh toán", Value: Summary.value?.PaymentFee, Currency: true },
  { Label: "Hoàn tiền", Value: Summary.value?.RefundAmount, Currency: true },
  { Label: "Đơn hoàn tất", Value: Summary.value?.CompletedOrderCount, Currency: false },
]);
const getCategoryLabel = (CategoryCode) => ExpenseCategories.find((Item) => Item.Value === CategoryCode)?.Label || CategoryCode;

const loadFinance = async () => {
  if (IsLoading.value) return;
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
  ErrorMessage.value = "";
  SuccessMessage.value = "";
  if (!ExpenseForm.Note.trim()) {
    ErrorMessage.value = "Vui lòng nhập nội dung khoản chi.";
    return;
  }
  if (!Amount || Amount <= 0) {
    ErrorMessage.value = "Số tiền phải lớn hơn 0.";
    return;
  }

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
  if (!await confirmDelete("Xóa khoản chi này?")) return;

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
    <header class="admin-page__header"><div><h1>{{ Text.Title }}</h1><p>{{ Text.Subtitle }}</p></div><button type="button" class="dm-btn" :disabled="IsLoading" @click="loadFinance">Tải lại dữ liệu</button></header>
    <div v-if="ErrorMessage" role="alert" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải tài chính...</div>
    <div v-if="!IsLoading && !ErrorMessage" class="admin-metrics">
      <article class="dm-card admin-metric"><span class="admin-metric__label">{{ Text.Revenue }}</span><div class="admin-metric__value">{{ formatCurrency(CurrentRevenue) }}</div></article>
      <article class="dm-card admin-metric admin-metric--expense"><span class="admin-metric__label">{{ Text.Expense }}</span><div class="admin-metric__value">{{ formatCurrency(CurrentExpense) }}</div></article>
      <article class="dm-card admin-metric admin-metric--profit"><span class="admin-metric__label">{{ Text.Profit }}</span><div class="admin-metric__value">{{ formatCurrency(CurrentProfit) }}</div></article>
      <article class="dm-card admin-metric"><span class="admin-metric__label">{{ Text.Margin }}</span><div class="admin-metric__value">{{ ProfitMargin.toFixed(1) }}%</div></article>
    </div>
    <article v-if="!IsLoading && !ErrorMessage" class="dm-card admin-panel admin-finance-breakdown">
      <div class="admin-panel__header"><div><h2>Cấu phần tài chính</h2><p>Tổng hợp theo kỳ báo cáo hiện tại của backend.</p></div></div>
      <dl><div v-for="Item in FinanceBreakdown" :key="Item.Label"><dt>{{ Item.Label }}</dt><dd>{{ Item.Value == null ? '—' : Item.Currency ? formatCurrency(Item.Value) : Item.Value }}</dd></div></dl>
    </article>
    <div class="admin-finance-grid">
      <article class="dm-card admin-panel">
        <div class="admin-panel__header"><div><h2>Doanh thu theo tháng</h2><p>Dữ liệu API hiện cung cấp doanh thu và số đơn hoàn tất theo kỳ.</p></div></div>
        <div v-if="!RevenueByMonth.length" class="admin-finance-empty">Chưa có dữ liệu doanh thu trong kỳ.</div>
        <div class="admin-chart">
          <div v-for="Item in RevenueByMonth" :key="Item.Period" class="admin-chart__group">
            <div class="admin-chart__bar" :style="{ height: `${((Item.ProductRevenue || 0) / ChartMaximum) * 100}%` }" :title="formatCurrency(Item.ProductRevenue || 0)"></div>
            <span class="admin-chart__label">{{ Item.Period }}</span>
            <small class="admin-chart__orders">{{ Item.CompletedOrderCount || 0 }} đơn</small>
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
      <div class="admin-table-wrap"><table class="dm-table"><thead><tr><th>Mã</th><th>Loại chi phí</th><th>Nội dung</th><th>Ngày</th><th>Số tiền</th><th></th></tr></thead><tbody><tr v-for="Item in Expenses" :key="Item.ExpenseId"><td>{{ Item.ExpenseId }}</td><td>{{ getCategoryLabel(Item.Category) }}</td><td>{{ Item.Note }}</td><td>{{ Item.ExpenseDate?.slice(0, 10) || '—' }}</td><td><strong>{{ formatCurrency(Item.Amount) }}</strong></td><td><button type="button" class="dm-btn-ghost" @click="removeExpense(Item.ExpenseId)">Xóa</button></td></tr><tr v-if="!Expenses.length"><td colspan="6" class="admin-finance-empty">Chưa có khoản chi nào trong kỳ.</td></tr></tbody></table></div>
    </article>
  </section>
</template>
<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
<style scoped lang="scss">
.admin-finance-breakdown dl { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin: 0; }
.admin-finance-breakdown dl > div { padding: 14px; border-radius: 12px; background: var(--dm-surface-soft); }
.admin-finance-breakdown dt { color: var(--dm-text-soft); font-size: 12px; }
.admin-finance-breakdown dd { margin: 8px 0 0; font-size: 18px; font-weight: 800; }
.admin-finance-empty { padding: 24px !important; color: var(--dm-text-soft); text-align: center; }
.admin-chart__orders { position: absolute; top: 4px; color: var(--dm-text-soft); white-space: nowrap; }
.admin-panel__header p { margin: 6px 0 0; color: var(--dm-text-soft); font-size: 13px; }
@media (max-width: 900px) { .admin-finance-breakdown dl { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 520px) { .admin-finance-breakdown dl { grid-template-columns: 1fr; } }
</style>
