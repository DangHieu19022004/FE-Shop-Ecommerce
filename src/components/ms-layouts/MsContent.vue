<template lang="">
  <div class="content__bg">
    <div class="content">
      <div class="content__header">
        <div class="content__header_left">Ứng viên</div>
        <div class="content__header_right">
          <div class="dpl hvp content__header_delete">
            <div class="icon__rm_user"></div>
            <div class="content__header_title_delete">
              Xóa dữ liệu ứng viên không trúng tuyển
            </div>
          </div>
          <div @click="emit('openFormAdd')" class="dpl hvp content__header_add">
            <div class="icon__add"></div>
            <div class="content_header_title_add">Thêm ứng viên</div>
          </div>
          <div class="content___header_dropdown">
            <div class="icon__dropdown"></div>
          </div>
        </div>
      </div>
      <div class="content__body_wrapper">
        <div class="content__body_header">
          <div class="content__body_header_left">
            <div class="icon__search_candidate">
              <div
                style="
                  background-image: url(https://amisplatform.misacdn.net/apps/recruit/assets/images/ai-feature/ai-search-candidate-start.svg);
                  background-repeat: no-repeat;
                  background-position: center;
                  background-size: cover;
                  width: 24px;
                  height: 24px;
                "
              ></div>
            </div>
            <input
              v-model="keyword"
              type="text"
              class="content__body_header_input"
              placeholder="Tìm kiếm hoặc nhờ AI trợ giúp..."
            />
          </div>
          <div class="content__body_header_right">
            <div class="content__filter_dropdown">
              <div class="border-btn" @click="toggleDropdown('filter')">
                <div class="icon__filter"></div>
              </div>
              <MsFilter v-if="activeDropdown === 'filter'" @filter="handleFilter" />
            </div>
            <div class="content__XLSX_dropdown">
              <div class="border-btn" @click="toggleDropdown('xlsx')">
                <div class="icon__export"></div>
              </div>
              <MsImportExportXLSX
                v-if="activeDropdown === 'xlsx'"
                @import="handleImport"
                @export="handleExport"
              />
            </div>
            <div class="border-btn">
              <div class="icon__toolbar"></div>
            </div>
            <div class="content__settings_dropdown">
              <div class="border-btn" @click="toggleDropdown('settings')">
                <div class="menu__icon sb__setting_icon"></div>
              </div>
              <MsVisibleColumns
                v-if="activeDropdown === 'settings'"
                :isOpen="activeDropdown === 'settings'"
                dropdown
                v-model:columns="localFieldsVisible"
              />
            </div>
          </div>
        </div>
        <div class="content__body_table">
          <MsTable
            tableClass="candicate_table"
            :fields="visibleFields"
            :dataRows="paginatedData"
            emptyText="Không có dữ liệu"
          >
            <template #header-checkbox>
              <input
                type="checkbox"
                name="selectedCandidates"
                id="select-all"
              />
            </template>
            <template #cell-checkbox="{ row }">
              <input
                type="checkbox"
                name="selectedCandidates"
                class="checkbox_item"
                :id="row.Id"
                :value="row.Id"
              />
            </template>
            <template #cell-full-name="{ row }">
              <div class="dpl avartar__name-cell">
                <div class="candidate-info m-r-8 flex-center-vertical">
                  <img
                    class="navbar__user_icon icon__user_item"
                    :src="row.Avatar"
                    alt=""
                    loading="lazy"
                  />
                </div>
                <div class="candidate-info__text">
                  <div class="candidate-name">{{ row.FullName }}</div>
                  <div v-if="row.isEmployed" class="dpl candidate-role">
                    <div class="icon__tick_green"></div>
                    <div class="green_text">Nhân viên</div>
                  </div>
                  <div v-else class="dpl candidate-role">
                    <div class="white_text">Nhân viên</div>
                  </div>
                </div>
              </div>
            </template>
            <template #cell-rating="{ row }">
              <i
                v-for="i in row.Rating"
                :key="row.Id + '-' + i"
                class="fa-solid fa-star"
              ></i>
            </template>
            <template #cell-application-date="{ row }">
              {{ new Date(row.ApplicationDate).toLocaleDateString() || "--" }}
            </template>
            <template #cell-actions="{ row }">
              <div class="btn__action">
                <div
                  class="btn__edit_item hvp"
                  :data-id="row.Id"
                  @click="emit('openFormEdit', row)"
                ></div>
                <div
                  class="btn__delete_item hvp"
                  :data-id="row.Id"
                  @click="emit('deleteItem', row)"
                >
                  <i class="fa-solid fa-trash"></i>
                </div>
              </div>
            </template>
          </MsTable>
        </div>
        <div class="content__body_footer">
          <div class="content__body_footer_counter">
            Tổng: {{ totalcandicates }} bản ghi
          </div>
          <div class="page__pagniation dpl">
            <div class="page__pragniation_title">Số bản ghi/trang</div>
            <div class="page__praniation_set_max_item">
              <select
                v-model="pageSize"
                class="page__praniation_set_max_item_number hvp"
              >
                <option :value="15" class="page__praniation_item">15</option>
                <option :value="25" class="page__praniation_item">25</option>
                <option :value="50" class="page__praniation_item">50</option>
                <option :value="100" class="page__praniation_item">100</option>
              </select>
              <!-- <div class="icon__dropdown_black m-l-8"></div> -->
            </div>
            <div class="page__pagniation_title">
              {{ startIndex }} - {{ endIndex }} bản ghi
            </div>
            <div class="page__pagniation_navigator dpl hvp">
              <div @click="btnPrevPage" class="page__pagniation_prev hvp">
                ‹
              </div>
              <div @click="btnNextPage" class="page__pagniation_next hvp">
                ›
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import MsTable from "../ms-table/MsTable.vue";
import MsFilter from "../ms-popup/MsFilter.vue";
import MsVisibleColumns from "../ms-popup/MsVisibleColumns.vue";
import MsImportExportXLSX from "../ms-popup/MsImportExportXLSX.vue";
import * as XLSX from "xlsx";
// VARIABLE:
const currentPage = ref(1);
const pageSize = ref(15);
let totalcandicates = ref(0);
const activeDropdown = ref(null);
const keyword = ref("");
const debouncedKeyword = ref("");
const activeFilters = ref({
  startDate: "",
  endDate: "",
  source: "",
  level: "",
  recruitment_round: "",
});
const searchDelayMs = 300;
let keywordTimer = null;
let paginTimer = null;
const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();
const toDateOnly = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

// so sánh từng item với filters để check xem có thỏa mãn hay không
const matchesFilters = (item, filters) => {
  const sourceQuery = normalize(filters.source);
  const levelQuery = normalize(filters.level);
  const recruitmentRoundQuery = normalize(filters.recruitment_round);
  // nếu có filter nguồn ứng viên thì check xem item có chứa chuỗi đó không
  if (sourceQuery && !normalize(item.CandidateSource).includes(sourceQuery)) {
    return false;
  }

  // nếu có filter trình độ đào tạo thì check xem item có chứa chuỗi đó không
  if (levelQuery && !normalize(item.EducationLevel).includes(levelQuery)) {
    return false;
  }

  // nếu có filter vòng tuyển dụng thì check xem item có chứa chuỗi đó không
  if (recruitmentRoundQuery && !normalize(item.RecruitmentStage).includes(recruitmentRoundQuery)) {
    return false;
  }

  // check ngày ứng tuyển có nằm trong khoảng startDate - endDate hay không
  const appDate = toDateOnly(item.ApplicationDate);
  const startDate = toDateOnly(filters.startDate);
  if (startDate && (!appDate || appDate < startDate)) {
    return false;
  }
  const endDate = toDateOnly(filters.endDate);
  if (endDate && (!appDate || appDate > endDate)) {
    return false;
  }

  // nếu item thỏa mãn thì trả true
  return true;
};
const fields = [
  {
    key: "",
    label: "",
    slot: "checkbox",
    classBody: "checkbox_item",
  },
  {
    key: "FullName",
    label: "Họ và tên",
    slot: "full-name",
    classHead: "avartar__name-cell",
    classBody: "dpl avartar__name-cell",
  },
  {
    key: "Phone",
    label: "Số điện thoại",
    classHead: "phone-cell",
    classBody: "phone-cell",
  },
  {
    key: "Email",
    label: "Email",
    classHead: "email-cell",
    classBody: "email-cell",
  },
  {
    key: "RecruitmentCampaign",
    label: "Chiến dịch tuyển dụng",
    classHead: "campaign-cell",
    classBody: "campaign-cell",
  },
  {
    key: "Position",
    label: "Vị trí tuyển dụng",
    classHead: "position-cell",
    classBody: "position-cell",
  },
  {
    key: "JobPosting",
    label: "Tin tuyển dụng",
    classHead: "job-posting-cell",
    classBody: "job-posting-cell",
  },
  {
    key: "RecruitmentStage",
    label: "Vòng tuyển dụng",
    classHead: "stage-cell",
    classBody: "stage-cell",
  },
  {
    key: "Rating",
    label: "Đánh giá",
    slot: "rating",
    classHead: "rating-cell",
    classBody: "rating-cell",
  },
  {
    key: "ApplicationDate",
    label: "Ngày ứng tuyển",
    slot: "application-date",
    classHead: "application-date-cell",
    classBody: "application-date-cell",
  },
  {
    key: "CandidateSource",
    label: "Nguồn ứng viên",
    classHead: "candidate-source-cell",
    classBody: "candidate-source-cell",
  },
  {
    key: "EducationLevel",
    label: "Trình độ đào tạo",
    classHead: "education-level-cell",
    classBody: "education-level-cell",
  },
  {
    key: "EducationPlace",
    label: "Nơi đào tạo",
    classHead: "education-place-cell",
    classBody: "education-place-cell",
  },
  {
    key: "Major",
    label: "Chuyên ngành",
    classHead: "major-cell",
    classBody: "major-cell",
  },
  {
    key: "RecentWorkplace",
    label: "Nơi làm việc gần đây",
    classHead: "recent-workplace-cell",
    classBody: "recent-workplace-cell",
  },
  {
    key: "PersonInCharge",
    label: "Nhân sự khai thác",
    classHead: "person-in-charge-cell",
    classBody: "person-in-charge-cell",
  },
  {
    key: "Department",
    label: "Đơn vị sử dụng",
    classHead: "department-cell",
    classBody: "department-cell",
  },
  {
    key: "actions",
    label: "",
    slot: "actions",
    classHead: "col_unhide",
    classBody: "col_unhide",
  },
];

/**
 * NOTICE: EMIT + PROP
 */
const emit = defineEmits([
  "openFormAdd",
  "openFormEdit",
  "deleteItem",
  "update:fieldsVisible",
  "alertImportData",
]);
const props = defineProps({
  dataProp: Array,
  fieldsVisible: Object,
});
const localFieldsVisible = computed({
  get: () => props.fieldsVisible || {},
  set: (value) => emit("update:fieldsVisible", value),
});
//check checkbox hiển thị cột để truyền vào component MsTable
const visibleFields = computed(() => {
  const visibility = props.fieldsVisible || {};
  return fields.filter((field) => {
    //check nếu là cột action thì luôn hiển thị
    if (!field.key || field.key === "actions") {
      return true;
    }
    //các cột còn lại thì check theo visibility
    return visibility[field.key] !== false;
  });
});

// NOTICE: Các computed properties để tính toán dữ liệu phân trang và lọc
/**
 * tính toán startIndex và endIndex để hiển thị dữ liệu phân trang bằng computed properties
 * thay thế updateCurrentPageDisplay()
 */
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value + 1);
const endIndex = computed(() =>
  Math.min(startIndex.value + pageSize.value - 1, totalcandicates.value),
);
/**
 * tính toán filteredData để hiển thị dữ liệu đã được lọc theo keyword tìm kiếm
 */
const filteredData = computed(() => {
  const data = props.dataProp || [];
  const q = normalize(debouncedKeyword.value);

  return data.filter((item) => {
    const keywordMatch =
      !q ||
      normalize(item.FullName).includes(q) ||
      normalize(item.Email).includes(q) ||
      normalize(item.Phone).includes(q) ||
      normalize(item.RecruitmentCampaign).includes(q) ||
      normalize(item.Position).includes(q) ||
      normalize(item.JobPosting).includes(q) ||
      normalize(item.RecruitmentStage).includes(q);

    if (!keywordMatch) {
      return false;
    }

    return matchesFilters(item, activeFilters.value);
  });
});

totalcandicates = computed(() => filteredData.value.length);

/**
 * slide data phân trang bằng computed để tự cập nhật theo data/page
 */
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

// NOTICE: Các watch để tự động cập nhật UI khi pageSize hoặc data thay đổi
watch(pageSize, () => {
  currentPage.value = 1;
});

watch(filteredData, () => {
  currentPage.value = 1;
});

watch(keyword, (nextValue) => {
  if (keywordTimer) {
    clearTimeout(keywordTimer);
  }
  keywordTimer = setTimeout(() => {
    debouncedKeyword.value = nextValue;
  }, searchDelayMs);
});

onBeforeUnmount(() => {
  if (keywordTimer) {
    clearTimeout(keywordTimer);
  }
  if (paginTimer) {
    clearTimeout(paginTimer);
  }
});

/**
 * FUNCTION:
 */

const handleExport = () => {
  const exportData = (props.dataProp || []).map((item) => {
    const { Avatar, ...rest } = item || {};
    return {
      ...rest,
      Avatar: Avatar && Avatar.length > 32767 ? "" : Avatar,
    };
  });
  //chuyen json sang worksheet
  const workSheet = XLSX.utils.json_to_sheet(exportData);
  //tao workbook
  const workBook = XLSX.utils.book_new();
  //them worksheet vao workbook
  XLSX.utils.book_append_sheet(workBook, workSheet, "Data");
  //tai file
  XLSX.writeFile(
    workBook,
    `employees_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};
const handleImport = async (file) => {
  if (!file) {
    return;
  }
  try {
    //chuyển file sang dạng binary (đổi thành ArrayBuffer-vùng nhớ chứa dữ liệu nhị phân để đọc bằng XLSX)
    const arrayBuffer = await file.arrayBuffer();
    // parse dữ liệu excel thành object JS bằng XLSX và lưu vào workBook
    const workBook = XLSX.read(arrayBuffer, { type: "array" });
    //Lấy tên sheet đầu tiên trong workbook
    const firstSheetName = workBook.SheetNames[0];
    //lấy dữ liệu trong sheet đầu tiên
    const workSheet = workBook.Sheets[firstSheetName];
    // chuyển dữ liệu trong sheet thành JSON array để hiển thị trong bảng
    const jsonData = XLSX.utils.sheet_to_json(workSheet, { defval: "" });
    emit("alertImportData", jsonData);
  } catch (error) {
    console.error("Error importing XLSX:", error);
  }
};
const handleFilter = (filterData) => {
  activeFilters.value = { ...activeFilters.value, ...filterData };
  activeDropdown.value = null;
};

const toggleDropdown = (name) => {
  activeDropdown.value = activeDropdown.value === name ? null : name;
};

const btnPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const btnNextPage = () => {
  if (pageSize.value * currentPage.value < totalcandicates.value) {
    currentPage.value++;
  }
};
</script>
<style lang=""></style>
