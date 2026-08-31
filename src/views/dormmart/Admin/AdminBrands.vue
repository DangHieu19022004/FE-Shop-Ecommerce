<template>
  <section class="admin-page" style="display: grid; gap: 18px;">
    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap;">
      <div>
        <h1 style="font-size: 36px; margin-bottom: 8px;">{{ Text.Title }}</h1>
        <p style="color: var(--dm-text-soft);">{{ Text.Subtitle }}</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <DMButton type="none" :is-tooltip="false" :message="Text.CreateNew" class="admin-button" @click="startCreate" />
        <DMButton type="none" :is-tooltip="false" :message="Text.Reload" class="dm-btn" @click="loadBrands" />
      </div>
    </div>

    <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; color: var(--dm-danger);">{{ ErrorMessage }}</div>
    <div v-if="SuccessMessage" class="dm-card" style="padding: 16px; color: var(--dm-primary);">{{ SuccessMessage }}</div>
    <div v-if="IsLoading" class="dm-card" style="padding: 16px;">{{ Text.LoadMessage }}</div>

    <div style="display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(320px, 1fr); gap: 18px; align-items: start;">
      <article class="dm-card" style="overflow: hidden;">
        <div style="overflow-x: auto;">
          <table class="dm-table" style="min-width: 720px;">
            <thead>
              <tr>
                <th>{{ Text.Name }}</th>
                <th>{{ Text.Slug }}</th>
                <th>{{ Text.Description }}</th>
                <th>{{ Text.Actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="Item in Brands" :key="Item.Id">
                <td><strong>{{ Item.Name }}</strong></td>
                <td>{{ Text.SlugPrefix }}{{ Item.Slug }}</td>
                <td>{{ Item.Description || "-" }}</td>
                <td>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <DMButton type="none" :is-tooltip="false" :message="Text.Edit" class="admin-button" @click="startEdit(Item)" />
                    <DMButton type="none" :is-tooltip="false" :message="Text.Delete" class="admin-button admin-button--danger" @click="removeBrand(Item)" />
                  </div>
                </td>
              </tr>
              <tr v-if="!Brands.length && !IsLoading">
                <td colspan="4" style="text-align: center; padding: 24px; color: var(--dm-text-soft);">{{ Text.EmptyState }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="dm-card" style="padding: 18px; display: grid; gap: 16px;">
        <div>
          <h2 style="margin-bottom: 6px;">{{ isEditing ? Text.UpdateTitle : Text.CreateTitle }}</h2>
          <p style="color: var(--dm-text-soft); margin: 0;">{{ Text.FormSubtitle }}</p>
        </div>

        <DMInput v-model="Form.Name" :label="Text.Name" />
        <DMInput v-model="Form.Description" :label="Text.Description" />

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <DMButton type="none" :is-tooltip="false" :message="IsSaving ? Text.Saving : (isEditing ? Text.SaveUpdating : Text.SaveCreating)" class="admin-button" @click="submitForm" />
          <DMButton type="none" :is-tooltip="false" :message="Text.Reset" class="dm-btn" @click="resetForm" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { createAdminBrand, deleteAdminBrand, updateAdminBrand } from "@/services/adminService";
import { getBrands } from "@/services/catalogService";
import { formatI18nText } from "@/utils/i18n";

const Text = inject("i18nCommon").AdminBrands;
const Brands = ref([]);
const ErrorMessage = ref("");
const SuccessMessage = ref("");
const IsLoading = ref(false);
const IsSaving = ref(false);
const EditingBrandId = ref("");
const Form = reactive({
  Name: "",
  Description: "",
});

const isEditing = computed(() => Boolean(EditingBrandId.value));
const buildBrandSlug = (Value) => {
  const Slug = String(Value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return Slug || `brand-${Date.now()}`;
};

const resetMessages = () => {
  ErrorMessage.value = "";
  SuccessMessage.value = "";
};

const resetForm = () => {
  Form.Name = "";
  Form.Description = "";
  EditingBrandId.value = "";
};

const loadBrands = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    Brands.value = await getBrands();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

const validateForm = () => {
  if (!Form.Name.trim()) return Text.ValidationNameRequired;
  return "";
};

const buildPayload = () => ({
  Name: Form.Name.trim(),
  Slug: buildBrandSlug(Form.Name),
  Description: Form.Description.trim() || null,
});

const startCreate = () => {
  resetMessages();
  resetForm();
};

const startEdit = (Brand) => {
  resetMessages();
  EditingBrandId.value = Brand.Id;
  Form.Name = Brand.Name || "";
  Form.Description = Brand.Description || "";
};

const submitForm = async () => {
  resetMessages();
  const ValidationError = validateForm();
  if (ValidationError) {
    ErrorMessage.value = ValidationError;
    return;
  }

  const Payload = buildPayload();
  IsSaving.value = true;

  try {
    if (isEditing.value) {
      await updateAdminBrand(EditingBrandId.value, Payload);
      SuccessMessage.value = formatI18nText(Text.UpdateSuccess, { name: Payload.Name });
    } else {
      await createAdminBrand(Payload);
      SuccessMessage.value = formatI18nText(Text.CreateSuccess, { name: Payload.Name });
    }

    resetForm();
    await loadBrands();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsSaving.value = false;
  }
};

const removeBrand = async (Brand) => {
  resetMessages();
  if (!window.confirm(formatI18nText(Text.ConfirmDelete, { name: Brand.Name }))) return;

  try {
    await deleteAdminBrand(Brand.Id);
    if (EditingBrandId.value === Brand.Id) {
      resetForm();
    }
    SuccessMessage.value = formatI18nText(Text.DeleteSuccess, { name: Brand.Name });
    await loadBrands();
  } catch (Error) {
    ErrorMessage.value = Error.message;
  }
};

onMounted(loadBrands);
</script>


<style scoped lang="scss" src="@/assets/styles/screens/admin-operations.scss"></style>
