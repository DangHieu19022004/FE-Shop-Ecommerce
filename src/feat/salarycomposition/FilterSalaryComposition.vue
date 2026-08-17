<template>
    <div class="filter-wrapper">
        <!-- Header -->
        <div class="filter-header">
            <p class="fz-16 fw-700">Bộ lọc</p>
            <DMButton iconLeft="mi-close" shapeBtn="circle" type="border-none" tooltipMessage="Đóng"
                tooltipPosition="bottom" @click="$emit('close')" />
        </div>

        <!-- Search -->
        <div class="content-body__search">
            <DMButton iconLeft="mi-search" tooltipMessage="Tìm kiếm" unActive tooltipPosition="bottom" />
            <DMInput v-model="searchKeyword" placeholder="Tìm kiếm" class="content-body__search-input" />
        </div>

        <!-- Danh sách cột lọc -->
        <div class="filter-group">
            <div v-for="item in filteredItems" :key="item.key"  :class="[item.checked ? 'filter-container m-b-8' : '', 'filter-item']">
                <div>
                    <DMCheckbox class="m-b-4 m-t-4" v-model="item.checked" :label="item.label" />
                    <DMSelect
                        v-if="item.checked"
                        v-model="item.condition"
                        :data="item.isSelect ? conditionsSelect : conditionsCompare"
                    />

                    <template v-if="item.checked && item.condition !== 'empty' && item.condition !== 'not_empty'">
                        <!-- Nếu là trường select thì dùng DMSelect -->
                        <DMSelect
                            v-if="item.isSelect"
                            v-model="item.value"
                            :data="item.options"
                            class="m-t-8 m-b-4"
                        />
                        <!-- Ngược lại dùng DMInput -->
                        <DMInput
                            v-else
                            v-model="item.value"
                            class="h-32 m-t-8 m-b-4"
                        />
                    </template>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="filter-footer">
            <DMButton :isTooltip="false" type="border-secondary" message="Bỏ lọc" @click="handleReset"
                class="btn-filter" />
            <DMButton :isTooltip="false" type="green" message="Áp dụng" @click="handleApply" class="btn-filter" />
        </div>
    </div>
</template>

<script setup>
/**
 * Mục đích: Component hiển thị bộ lọc bên phải bảng Thành phần lương.
 * Sử dụng trong trường hợp: Người dùng nhấn nút Bộ lọc để lọc nâng cao dữ liệu.
 * Hàm quan trọng: handleApply, handleReset.
 * CREATED BY: TDHieu (08/06/2026)
 */
import { reactive, ref, computed, watch } from 'vue';
import DMCheckbox from '@/components/base/DMCheckbox.vue';
import DMButton from '@/components/base/DMButton.vue';
import DMInput from '@/components/base/DMInput.vue';
import DMSelect from '@/components/base/DMSelect.vue';
import {
    SalaryCompositionNatureOptions,
    SalaryCompositionValueTypeOptions,
    SalaryCompositionShowPaycheckOptions,
    SalaryCompositionTypeOptions,
    SalaryCompositionTaxableOptions,
    SalaryCompositionSourceTypeOptions,
    SalaryCompositionTaxDeductionOptions
} from '@/constants/enums.js';

// Khai báo emit cho các sự kiện của component
const emit = defineEmits(['close', 'apply', 'reset']);

// Từ khóa tìm kiếm để lọc nhanh danh sách các trường
const searchKeyword = ref('');

// Danh sách các phép toán so sánh cho input text
const conditionsCompare = [
    { label: 'Chứa', value: 'contains' },
    { label: 'Không chứa', value: 'not_contains' },
    { label: 'Bằng', value: 'equal' },
    { label: 'Khác', value: 'not_equal' },
    { label: 'Bắt đầu bằng', value: 'starts_by' },
    { label: 'Kết thúc bằng', value: 'ends_by' },
    { label: 'Trống', value: 'empty' },
    { label: 'Không trống', value: 'not_empty' },
];

// Danh sách các phép toán so sánh cho select box
const conditionsSelect = [
    { label: 'Bằng', value: 'equal' },
    { label: 'Khác', value: 'not_equal' },
    { label: 'Trống', value: 'empty' },
    { label: 'Không trống', value: 'not_empty' },
];

// Danh sách các mục cấu hình bộ lọc ban đầu
const filterItems = reactive([
    { key: 'salary_composition_code', label: 'Mã thành phần', checked: false, condition: 'contains', value: '' },
    { key: 'salary_composition_name', label: 'Tên thành phần', checked: false, condition: 'contains', value: '' },
    { key: 'composition_type', label: 'Loại thành phần', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionTypeOptions },
    { key: 'composition_nature', label: 'Tính chất', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionNatureOptions },
    { key: 'taxable', label: 'Chịu thuế', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionTaxableOptions },
    { key: 'tax_deduction', label: 'Giảm trừ khi tính thuế', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionTaxDeductionOptions },
    { key: 'quota', label: 'Định mức', checked: false, condition: 'contains', value: '' },
    { key: 'value_type', label: 'Kiểu giá trị', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionValueTypeOptions },
    { key: 'formula', label: 'Giá trị', checked: false, condition: 'contains', value: '' },
    { key: 'description', label: 'Mô tả', checked: false, condition: 'contains', value: '' },
    { key: 'source_type', label: 'Nguồn tạo', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionSourceTypeOptions },
    { key: 'option_show_paycheck', label: 'Hiển thị trên phiếu lương', checked: false, condition: 'equal', value: '', isSelect: true, options: SalaryCompositionShowPaycheckOptions },
]);

// Danh sách các mục cấu hình sau khi đã áp dụng lọc tìm kiếm
const filteredItems = computed(() => {
    if (!searchKeyword.value) return filterItems;
    const lowerKeyword = searchKeyword.value.toLowerCase();
    return filterItems.filter(item => item.label.toLowerCase().includes(lowerKeyword));
});

/**
 * Bỏ lọc và thiết lập lại các điều kiện lọc về mặc định.
 *
 * Sử dụng khi: Người dùng nhấn nút "Bỏ lọc" ở dưới cùng sidebar.
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleReset = () => {
    filterItems.forEach((item) => {
        item.checked = false;
        item.condition = item.isSelect ? 'equal' : 'contains';
        item.value = '';
    });
    emit('reset');
    emit('close');
};

/**
 * Áp dụng điều kiện lọc và gọi sự kiện lên component cha.
 *
 * Sử dụng khi: Người dùng cấu hình xong các cột lọc và nhấn "Áp dụng".
 *
 * @returns {void}
 *
 * CREATED BY: TDHieu (09/06/2026)
 */
const handleApply = () => {
    const selected = filterItems
        .filter((i) => i.checked)
        .map((i) => ({
            column: i.key,
            condition: i.condition,
            value: i.value
        }));
    emit('apply', selected);
};
</script>

<style scoped>
/* ── Sidebar panel ── */
.filter-wrapper {
    width: 260px;
    flex-shrink: 0;
    background: #fff;
    border-radius: 8px;
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
    padding: 12px 13px 0px 20px;
    flex-shrink: 0;
}

.filter-container{
    background-color: hsl(150 67% 95% / 1)
}

/* ── Search ── */
.content-body__search {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 6px;
    height: 32px;
    border: 1px solid #d9dee7;
    margin: 8px 19px 4px;
    flex-shrink: 0;
}

.content-body__search:hover,
.content-body__search:focus-within {
    border-color: #0E9A62;
}

:deep(.ms-input-in.content-body__search-input) {
    color: #111;
    background-color: transparent;
    border: none;
    font-size: 13px;
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
    display: flex;
    flex-direction: column;
    /* gap: 4px; */
}

.filter-item {
    padding: 2px 12px;
    border-radius: 8px;
    transition: background 0.12s ease;
    cursor: pointer;
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
    background: #f9f9f9;
}

.filter-footer :deep(.ms-button) {
    justify-content: center;
}

.btn-filter {
    width: 80px !important;
    height: 32px !important;
    padding: 0 !important;
    color: #000;
}

/* Đặt font-size 13px cho toàn bộ Input, Select, Checkbox */
:deep(.ms-checkbox__label),
:deep(.ms-input-in),
:deep(.multiselect__single),
:deep(.multiselect__placeholder),
:deep(.multiselect__option),
:deep(.multiselect__input) {
    font-size: 13px !important;
}
</style>
