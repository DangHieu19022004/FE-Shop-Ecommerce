<template>
    <div class="filter-wrapper">
        <!-- Header -->
        <div class="filter-header">
            <p class="fz-14 fw-500">Bộ lọc</p>
            <MsButton iconLeft="mi-close" shapeBtn="circle" type="border-none" tooltipMessage="Đóng"
                tooltipPosition="bottom" @click="$emit('close')" />
        </div>

        <!-- Search -->
        <div class="content-body__search">
            <MsButton iconLeft="mi-search" tooltipMessage="Tìm kiếm" unActive tooltipPosition="bottom" />
            <MsInput placeholder="Tìm kiếm" class="content-body__search-input" />
        </div>

        <!-- Danh sách cột lọc -->
        <div class="filter-group">
            <div v-for="item in filterItems" :key="item.key" class="filter-item">
                <MsCheckbox v-model="item.checked" :label="item.label" class="fz-14" />
            </div>
        </div>

        <!-- Footer -->
        <div class="filter-footer">
            <MsButton :isTooltip="false" type="border-secondary" message="Bỏ lọc" @click="handleReset"
                class="btn-filter fz-14" />
            <MsButton :isTooltip="false" type="green" message="Áp dụng" @click="handleApply" class="btn-filter fz-14" />
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import MsCheckbox from '@/components/base/MsCheckbox.vue';
import MsButton from '@/components/base/MsButton.vue';
import MsInput from '@/components/base/MsInput.vue';

const emit = defineEmits(['close', 'apply', 'reset']);

const filterItems = reactive([
    { key: 'salary_composition_code', label: 'Mã thành phần', checked: false },
    { key: 'salary_composition_name', label: 'Tên thành phần', checked: false },
    { key: 'composition_type', label: 'Loại thành phần', checked: false },
    { key: 'composition_nature', label: 'Tính chất', checked: false },
    { key: 'taxable', label: 'Chịu thuế', checked: false },
    { key: 'tax_deduction', label: 'Giảm trừ khi tính thuế', checked: false },
    { key: 'quota', label: 'Định mức', checked: false },
    { key: 'value_type', label: 'Kiểu giá trị', checked: false },
    { key: 'formula', label: 'Giá trị', checked: false },
    { key: 'description', label: 'Mô tả', checked: false },
    { key: 'source_type', label: 'Nguồn tạo', checked: false },
    { key: 'option_show_paycheck', label: 'Hiển thị trên phiếu lương', checked: false },
]);

const handleReset = () => {
    filterItems.forEach((item) => (item.checked = false));
    emit('reset');
};

const handleApply = () => {
    const selected = filterItems.filter((i) => i.checked).map((i) => i.key);
    emit('apply', selected);
};
</script>

<style scoped>
/* ── Sidebar panel ── */
.filter-wrapper {
    width: 260px;
    flex-shrink: 0;
    background: #fff;
    border: 1px solid #d9dee7;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

/* ── Header ── */
.filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px 0px 16px;
    flex-shrink: 0;
}

/* ── Search ── */
.content-body__search {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 6px;
    height: 32px;
    border: 1px solid #d9dee7;
    margin: 12px 12px 4px;
    flex-shrink: 0;
}

.content-body__search:hover,
.content-body__search:focus-within {
    border-color: #34B057;
}

:deep(.ms-input-in.content-body__search-input) {
    color: #111;
    background-color: transparent;
    border: none;
    font-size: 14px;
}

:deep(.ms-input-in.content-body__search-input:focus),
:deep(.ms-input-in.content-body__search-input:focus-visible) {
    border: none;
    outline: none !important;
    box-shadow: none;
}

/* ── List ── */
.filter-group {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px;
}

.filter-item {
    padding: 5px 8px;
    border-radius: 4px;
    transition: background 0.12s ease;
    cursor: pointer;
}

.filter-item:hover {
    background-color: #f3f4f6;
}

/* ── Footer ── */
.filter-footer {
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    gap: 8px;
    flex-shrink: 0;
    background: #fff;
}

.filter-footer :deep(.ms-button) {
    justify-content: center;
}

.btn-filter {
    width: 80px !important;
    height: 32px !important;
    padding: 0 !important;
}
</style>