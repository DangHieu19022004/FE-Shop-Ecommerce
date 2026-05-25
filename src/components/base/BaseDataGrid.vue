<template>
	<div class="base-data-grid">
		<DxDataGrid
			:data-source="dataSource"
			:key-expr="keyExpr"
			:hover-state-enabled="true"
			:allow-column-resizing="true"
			:allow-column-reordering="true"
			column-resizing-mode="widget"
			:column-auto-width="false"
			:word-wrap-enabled="false"
			:show-borders="false"
			:no-data-text="'Không có dữ liệu'"
			:height="height"
			:width="'100%'"
			@row-click="handleRowClick"
			@selection-changed="handleSelectionChanged"
		>
			<DxSelection mode="multiple" show-check-boxes-mode="always" />

			<DxScrolling
				mode="standard"
				show-scrollbar="always"
				:use-native="true"
			/>

			<DxPaging :page-size="pageSize" />

			<DxPager
				:visible="true"
				:show-info="true"
				:show-page-size-selector="false"
			/>

			<DxColumnFixing :enabled="true" />
			<DxSorting mode="multiple" />

			<DxColumn
				v-for="col in columns"
				:key="col.dataField || col.name"
				:data-field="col.dataField"
				:name="col.name"
				:caption="col.caption"
				:width="col.width || 180"
				:min-width="col.minWidth || col.width || 180"
				:fixed="col.fixed"
				:fixed-position="col.fixedPosition"
				:allow-sorting="col.allowSorting ?? true"
				:cell-template="col.cellTemplate"
				:calculate-display-value="col.calculateDisplayValue"
			/>

			<template
				v-for="(slotFn, name) in $slots"
				v-slot:[name]="slotProps"
			>
				<slot :name="name" v-bind="slotProps" />
			</template>
		</DxDataGrid>
	</div>
</template>

<script setup>
import {
	DxDataGrid,
	DxColumn,
	DxSelection,
	DxPaging,
	DxPager,
	DxColumnFixing,
	DxSorting,
	DxScrolling,
} from "devextreme-vue/data-grid";

defineProps({
	columns: {
		type: Array,
		default: () => [],
	},
	dataSource: {
		type: [Array, Object],
		default: () => [],
	},
	keyExpr: {
		type: String,
		default: "id",
	},
	pageSize: {
		type: Number,
		default: 100,
	},
	height: {
		type: [Number, String],
		default: "calc(100vh - 220px)",
	},
});

const emit = defineEmits(["row-click", "selection-changed"]);

const handleRowClick = (e) => {
	emit("row-click", e);
};

const handleSelectionChanged = (e) => {
	emit("selection-changed", {
		selectedRowKeys: e.selectedRowKeys,
		selectedRowsData: e.selectedRowsData,
	});
};
</script>

<style scoped>
.base-data-grid {
	width: 100%;
	height: 100%;
	overflow: hidden;
}

:deep(.dx-datagrid) {
	font-size: 14px;
	background: #fff;
}

:deep(.dx-datagrid-headers) {
	background-color: #f5f5f5;
}

:deep(.dx-header-row > td) {
	height: 40px;
	background-color: #f5f5f5;
	border-bottom: 1px solid #e0e0e0;
	white-space: nowrap;
}

:deep(.dx-row > td) {
	height: 48px;
	border-bottom: 1px solid #ededed;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

:deep(.dx-data-row.dx-state-hover) {
	background-color: #f7f7f7;
}

:deep(.dx-datagrid-rowsview),
:deep(.dx-datagrid-headers),
:deep(.dx-datagrid-total-footer) {
	overflow: hidden;
}
</style>