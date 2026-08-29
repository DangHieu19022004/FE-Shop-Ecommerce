<script setup>
import { inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import {
  adjustAdminInventory,
  getAdminInventories,
  getAdminInventoryTransactions,
  importAdminInventory,
} from "@/services/adminService";
import { formatDateTime } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").AdminProducts;
const InventoryItems = ref([]);
const TransactionMap = reactive({});
const FormMap = reactive({});
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);

const statusStyle = (Quantity) => {
  if (Quantity <= 0) return "background: rgba(239, 68, 68, 0.12); color: var(--dm-danger);";
  if (Quantity <= 5) return "background: rgba(253,192,3,0.18); color: var(--dm-secondary-text);";
  return "background: rgba(0,191,165,0.1); color: var(--dm-success);";
};

const statusText = (Quantity) => {
  if (Quantity <= 0) return Text.OutOfStock;
  if (Quantity <= 5) return "Sắp hết hàng";
  return Text.Active;
};

const ensureForm = (VariantId) => {
  if (!FormMap[VariantId]) {
    FormMap[VariantId] = { Quantity: 1, Note: "" };
  }

  if (!TransactionMap[VariantId]) {
    TransactionMap[VariantId] = [];
  }

  return FormMap[VariantId];
};

const loadInventories = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const Data = await getAdminInventories();
    InventoryItems.value = Array.isArray(Data?.Items) ? Data.Items : [];
    await Promise.all(
      InventoryItems.value.map(async (Item) => {
        ensureForm(Item.ProductVariantId);
        TransactionMap[Item.ProductVariantId] = await getAdminInventoryTransactions(Item.ProductVariantId);
      }),
    );
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const runStockAction = async (Item, Action) => {
  const Form = ensureForm(Item.ProductVariantId);
  const Payload = {
    Quantity: Number(Form.Quantity) || 0,
    Note: Form.Note || null,
  };

  if (Payload.Quantity <= 0) {
    ErrorMessage.value = "Số lượng phải lớn hơn 0.";
    return;
  }

  try {
    if (Action === "import") {
      await importAdminInventory(Item.ProductVariantId, Payload);
      SuccessMessage.value = `Đã nhập kho ${Item.ProductName}`;
    } else {
      await adjustAdminInventory(Item.ProductVariantId, { ...Payload, Quantity: -Math.abs(Payload.Quantity) });
      SuccessMessage.value = `Đã điều chỉnh tồn kho ${Item.ProductName}`;
    }
    await loadInventories();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadInventories);
</script>

<template>
  <section style="display: grid; gap: 18px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div>
        <h1 style="font-size: 36px; margin-bottom: 8px;">{{ Text.Title }}</h1>
        <p style="color: var(--dm-text-soft);">Inventory thật từ `/api/admin/inventories`. Giữ UI tối giản để test API sau merge.</p>
      </div>
      <DMButton type="none" :is-tooltip="false" message="Tải lại" class="dm-btn" @click="loadInventories" />
    </div>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">Đang tải tồn kho...</div>

    <article class="dm-card" style="overflow: hidden;">
      <div style="overflow-x: auto;">
        <table class="dm-table" style="min-width: 1080px;">
          <thead>
            <tr>
              <th>{{ Text.Product }}</th>
              <th>Biến thể</th>
              <th>{{ Text.ProductCode }}</th>
              <th>{{ Text.Inventory }}</th>
              <th>{{ Text.Status }}</th>
              <th>Nhập/giảm tồn</th>
              <th>Giao dịch gần nhất</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="Item in InventoryItems" :key="Item.ProductVariantId">
              <td>{{ Item.ProductName }}</td>
              <td>{{ Item.VariantName || '-' }}</td>
              <td>{{ Item.Sku }}</td>
              <td>{{ Item.Quantity }}</td>
              <td><span class="dm-pill" :style="statusStyle(Item.Quantity)">{{ statusText(Item.Quantity) }}</span></td>
              <td>
                <div style="display: grid; gap: 8px; min-width: 280px;">
                  <DMInput v-model="FormMap[Item.ProductVariantId].Quantity" label="Số lượng" type="number" />
                  <DMInput v-model="FormMap[Item.ProductVariantId].Note" label="Ghi chú" />
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <DMButton type="none" :is-tooltip="false" message="Nhập kho" class="admin-button" @click="runStockAction(Item, 'import')" />
                    <DMButton type="none" :is-tooltip="false" message="Giảm tồn" class="admin-button admin-button--danger" @click="runStockAction(Item, 'adjust')" />
                  </div>
                </div>
              </td>
              <td>
                <div v-if="TransactionMap[Item.ProductVariantId]?.length" style="display: grid; gap: 4px;">
                  <strong>{{ TransactionMap[Item.ProductVariantId][0].TransactionType }}</strong>
                  <span>{{ TransactionMap[Item.ProductVariantId][0].QuantityBefore }} -> {{ TransactionMap[Item.ProductVariantId][0].QuantityAfter }}</span>
                  <span>{{ formatDateTime(TransactionMap[Item.ProductVariantId][0].CreateDate) }}</span>
                  <span>{{ TransactionMap[Item.ProductVariantId][0].Note || '-' }}</span>
                </div>
                <span v-else>-</span>
              </td>
            </tr>
            <tr v-if="!InventoryItems.length && !IsLoading">
              <td colspan="7" style="text-align: center; padding: 24px; color: var(--dm-text-soft);">Chưa có dữ liệu tồn kho từ API.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<style scoped src="@/assets/styles/screens/admin-operations.css"></style>

<!-- ponytail: view chỉ phủ inventory APIs, chưa làm product CRUD; add when backend có admin product contract rõ ràng. -->
