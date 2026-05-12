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