<template lang="">
<div class="ms-xlsx">
    <MsButton type="primary" @click="handleImport">Import XLSX</MsButton>
    <MsButton type="primary" @click="$emit('export')">Export XLSX</MsButton>
    <MsInput type="file" accept=".xlsx, .xls" @change="handleFileChange" style="display: none" ref="fileInput" />
</div>
</template>
<script setup>
import MsButton from '../../components/base/MsButton.vue'
import {defineEmits, ref } from 'vue';
import MsInput from '../../components/base/MsInput.vue';

const emit = defineEmits(['export', 'import']);

const fileInput = ref(null);
const handleImport = () => {
    fileInput.value.click();
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        emit('import', file);
    }
};

</script>
<style scoped>
.ms-xlsx {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 200px;
    background: #fff;
    border: 1px solid #dfe1e6;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 10px 24px rgba(17, 24, 39, 0.12);
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.ms-xlsx :deep(.ms-button) {
    width: 100%;
    justify-content: center;
}
</style>