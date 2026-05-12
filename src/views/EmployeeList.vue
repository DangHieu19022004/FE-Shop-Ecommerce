<template lang="">
    <MsContent
        :dataProp="props.dataProp"
        v-model:fieldsVisible="localFieldsVisible"
        @openFormAdd="handleOpenFormAdd"
        @openFormEdit="handleOpenFormEdit"
        @deleteItem="handleDeleteItem"
        @alertImportData="handleAlertImportData"
      />
</template>
<script setup>
import MsContent from "@/features/employees/MsContent.vue";
import { defineProps, defineEmits, computed } from "vue";
const props = defineProps({
  dataProp: {
    type: Array,
    required: true
  },
  fieldsVisible: {
    type: Object,
    required: true
  }
});
const emit = defineEmits([
  "openFormAdd",
  "openFormEdit",
  "deleteItem",
  "update:fieldsVisible",
  "error",
  "alertImportData"
]);
const localFieldsVisible = computed({
  get: () => props.fieldsVisible,
  set: (value) => emit("update:fieldsVisible", value),
});
const handleOpenFormAdd = () => {
  emit("openFormAdd");
};
const handleOpenFormEdit = (row) => {
  emit("openFormEdit", row);
};
const handleDeleteItem = (row) => {
  emit("deleteItem", row);
};
const handleAlertImportData = (jsonData) => {
  emit("alertImportData", jsonData);
};
</script>
<style lang="">
    
</style>