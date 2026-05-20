<template>
  <table :class="tableClass">
    <thead :class="tableClassHead" :id="tableIdHead">
      <tr>
        <th
          v-for="(field, index) in fields"
          :key="index"
          :class="field.classHead"
        >
          <!-- thuộc tính name trong slot để cụ thể hóa thẻ con muốn truyền vào
         ví dụ <template #header-name> sẽ truyền vào thẻ có name là header-name, dùng trong trường hợp
        con có nhiều thẻ như input, div, img,... và muốn truyền vào thẻ nào thì đặt name tương ứng với 
        thẻ đó, nếu không có thì sẽ lấy field.label
        -->
          <slot :name="`header-${field.slot || field.key}`" :field="field">
            {{ field.label }}
          </slot>
          <!-- còn truyền field vào có tác dụng:
         Con cho cha mượn biến field để dùng khi render UI
         Nếu không truyền field thì cha sẽ không biêt là đang ở dòng nào để
         hiển thị cho đúng
        -->
        </th>
      </tr>
    </thead>

    <tbody :class="tableClassBody" :id="tableIdBody">
      <tr v-if="dataRows.length === 0">
        <td :colspan="fields.length" class="text-center">
          {{ emptyText }}
        </td>
      </tr>

      <tr
        v-else
        v-for="(row, rowIndex) in dataRows"
        :key="rowIndex"
        @click="emit('row-click', row)"
      >
        <td
          v-for="(field, colIndex) in fields"
          :key="colIndex"
          :class="field.classBody"
        >
          <slot :name="`cell-${field.slot || field.key}`" :row="row">
            <!-- key là thuộc tính trong bảng hay đối tượng hay dùng. Ví dụ item.Phone thì row[] -->
            {{ row[field.key] || "--"}}
            <!-- tương tự truyền row để cho cha mượn biến row để dùng khi render UI
            nếu không truyền thì đố thằng cha nào biết đang ở dòng nào để hiển thị cho đúng :))) 
            -->
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  fields: {
    type: Array,
    default: () => [],
  },
  dataRows: {
    type: Array,
    default: () => [],
  },

  emptyText: {
    type: String,
    default: "Không có dữ liệu",
  },

  tableClass: {
    type: [String, Array, Object],
    default: "",
  },

  tableClassHead: {
    type: [String, Array, Object],
    default: "",
  },

  tableIdHead: {
    type: String,
    default: "",
  },

  tableClassBody: {
    type: [String, Array, Object],
    default: "",
  },

  tableIdBody: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["row-click"]);
</script>
<style>
.content__body_table {
  flex: 1;
  width: 100%;
  overflow: auto;
}

.candicate_table {
  border-collapse: collapse;
  min-width: max-content;
}

th {
  position: sticky;
  top: 0;
  border-top: 1.5px solid #ddd;
  background-color: #f9fafb !important;
  height: 40px;
  z-index: 1;
}

th,
td {
  border-bottom: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  background-color: #fff;
  font-size: 14px;
}

tr {
  height: 48px;
}

.col_unhide {
  position: sticky;
  right: 0;
  z-index: 2;
}

.col_unhide .btn__action {
  display: none;
}

tbody tr:hover .btn__action {
  display: flex;
}

.icon__tick_green {
  -webkit-mask-image: url(https://amisplatform.misacdn.net/apps/recruit/assets/images/ICON.svg);
  -webkit-mask-position: -208px -32px;
  -webkit-mask-repeat: no-repeat;
  width: 16px;
  height: 16px;
  background-color: green;
}

.green_text {
  color: green;
  margin-left: 4px;
}

.btn__edit_item {
  width: 20px;
  height: 20px;
  min-width: 20px;
  -webkit-mask-image: url(/src/assets//icons/ICON.svg);
  -webkit-mask-position: -180px -656px;
  -webkit-mask-repeat: no-repeat;
  background-color: #7a8188;
}

.white_text {
  color: #fff;
  margin-left: 4px;
}

.content__body_footer {
  display: flex;
  align-items: center;
  padding: 12px;
  justify-content: space-between;
  background-color: #f5f5f5;
  align-items: center;
}

.icon__dropdown_black {
  -webkit-mask-image: url(https://amisplatform.misacdn.net/apps/recruit/assets/images/ICON.svg);
  -webkit-mask-position: -32px -48px;
  -webkit-mask-repeat: no-repeat;
  width: 14px;
  height: 14px;
  background-color: #000;
}

.icon__user_item {
  width: 24px;
  height: 24px;
}

.page__pagniation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page__praniation_set_max_item {
  display: flex;
  align-items: center;
  padding: 7px 16px;
  border: 0.5px solid #dfe1e6;
}

.page__pagniation_prev {
  padding: 4px;
}

.page__pagniation_next {
  padding: 4px;
}

.btn__action {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.col-hidden {
  display: none !important;
}
</style>