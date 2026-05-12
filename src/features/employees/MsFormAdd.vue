<template lang="">
  <div class="modal_form">
    <div class="modal_form_wrapper">
      <div class="form__header">
        <div class="form__header_title">Thêm ứng viên</div>
        <div @click="emit('close')" class="icon__exit hvp"></div>
      </div>
      <div class="form__uploadcv">
        <MsInput
          id="uploadcv"
          name="uploadcv"
          :type="typeInput.file"
          accept=".docx, .pdf, .doc, .jpg, .jpeg, .png"
        >
        </MsInput>
        <label for="uploadcv" class="form__uploadcv_sub">
          <div class="form__uploadcv_sub_title">
            Kéo thả hoặc bấm vào đây để tải CV lên
          </div>
          <div class="form__uploadcv_sub_content">
            Chấp nhận file .doc, .docx, .pdf, .jpg, .jpeg, .png (Dung lượng < hơn 15 Mb)
          </div>
        </label>
      </div>
      <div class="form__uploadcv_content">
        <div class="form__uploadcv_content_left">
          <label
            v-if="!avatarSrc"
            for="img_avatar"
            class="form__uploadcv_content_left__title"
            >{{ avatarLabel }}</label
          >
          <img
            v-if="avatarSrc"
            :src="avatarSrc"
            alt="avatar"
            class="form__uploadcv_content_left__avatar"
            @click="clearAvatar"
          />
          <MsInput
            v-else
            v-model="formData.Avatar"
            id="img_avatar"
            name="img_avatar"
            :type="typeInput.file"
            accept=".jpg, .jpeg, .png"
          >
          </MsInput>
        </div>
        <div class="form__uploadcv_main">
          <div class="cv__fullname">
            <div class="cv__fullname_title">
              Họ và tên <span class="color_red">*</span>
            </div>
            <MsInput
              v-model="formData.FullName"
              type="text"
              name="cv_fullname"
              id="cv_fullname"
              placeholder="Nhập họ và tên"
              :errorMessages="isTouched('FullName') ? errorMessages.FullName : ''"
              @blur="markTouched('FullName')"
              @focus="unMarkTouched('FullName')"
            />
          </div>
          <div class="dpl split-2cols m-b-8">
            <div class="cv__birtdate col-1">
              <div class="cv__birtdate_title">
                <div class="cv__birtdate_text">Ngày sinh</div>
                <MsSelect
                  name="birtdate"
                  id="birtdate"
                  :data="[
                    { value: 'date_month_year', label: 'Ngày tháng năm' },
                    { value: 'year', label: 'Năm' },
                    { value: 'month_year', label: 'Tháng năm' }
                  ]"
                  keyChosen="ngày sinh"
                >
                </MsSelect>
              </div>
              <div class="cv_birtdate_chosen">
                <MsInput
                  v-model="formData.BirthDay"
                  type="date"
                  name="cv_birtdate"
                  id="cv_birtdate"
                  class="hvp"
                  @focus="unMarkTouched('BirthDay')"
                  @blur="markTouched('BirthDay')"
                  :errorMessages="isTouched('BirthDay') ? errorMessages.BirthDay : ''"
                >
                </MsInput>
              </div>
            </div>
            <div class="cv__gender col-1">
              <label for="gender" class="cv__gender_title hvp">Giới tính</label>
              <MsSelect
                name="gender"
                id="gender"
                :data="[
                  { value: 'male', label: 'Nam' },
                  { value: 'female', label: 'Nữ' }
                ]"
                keyChosen="Giới tính"
                v-model="formData.Gender"
                @blur="markTouched('Gender')"
                @focus="unMarkTouched('Gender')"
                :errorMessages="isTouched('Gender') ? errorMessages.Gender : ''"
              >
              </MsSelect>
            </div>
          </div>
          <div class="cv__area">
            <label for="cv_area" class="cv__area_title">Khu vực</label>
            <div class="cv__area_chosen hvp">
              <MsSelect
                  name="cv_area"
                  id="cv_area"
                  :data="[
                    { value: 'hanoi', label: 'Hà Nội' },
                    { value: 'hochiminh', label: 'Hồ Chí Minh' }
                  ]"
                  keyChosen="khu vực"
                  v-model="formData.Area"
                  @blur="markTouched('Area')"
                  @focus="unMarkTouched('Area')"
                  :errorMessages="isTouched('Area') ? errorMessages.Area : ''"
                >
              </MsSelect>
              <div class="icon__moreinfo_wrapper hvp">
                <div class="icon__moreinfo"></div>
              </div>
            </div>
          </div>
          <div class="dpl split-2cols m-b-8">
            <div class="cv__phonenumber col-1">
              <div class="cv__phonenumber_text">Số điện thoại</div>
              <div class="cv_phonenumber_chosen">
                <MsInput
                  v-model="formData.Phone"
                  type="text"
                  name="cv_phonenumber"
                  placeholder="Nhập số điện thoại"
                  id="cv_phonenumber"
                  :errorMessages="isTouched('Phone') ? errorMessages.Phone : ''"
                  @blur="markTouched('Phone')"
                  @focus="unMarkTouched('Phone')"
                >
                </MsInput>
              </div>
            </div>
            <div class="cv__email col-1">
              <label for="cv_email" class="cv__email_title">Email</label>
              <MsInput
                v-model="formData.Email"
                type="email"
                name="cv_email"
                placeholder="Nhập email"
                id="cv_email"
                required
                :errorMessages="isTouched('Email') ? errorMessages.Email : ''"
                @blur="markTouched('Email')"
                @focus="unMarkTouched('Email')"
              />
            </div>
          </div>
          <div class="cv__country m-b-8">
            <label for="country" class="cv__country_title">Quốc gia</label>
            <MsSelect
              name="country"
              id="country"
              :data="[
                { value: 'vn', label: 'Việt Nam' },
                { value: 'us', label: 'Hoa Kỳ' }
              ]"
              keyChosen="quốc gia"
              v-model="formData.Country"
            />
          </div>
          <div class="cv__city m-b-8">
            <label for="city" class="cv__city_title">Tỉnh/Thành phố</label>
            <MsSelect
              name="city"
              id="city"
              :data="[
                { value: 'hn', label: 'Hà Nội' },
                { value: 'sg', label: 'TP. Hồ Chí Minh' }
              ]"
              keyChosen="tỉnh thành phố"
              v-model="formData.City"
            />
          </div>
          <div class="cv__wards m-b-8">
            <label for="wards" class="cv__wards_title">Phường/Xã</label>
            <MsSelect
              name="wards"
              id="wards"
              :data="[
                { value: 'tay_mo', label: 'Tây Mỗ' },
                { value: 'dai_mo', label: 'Đại Mỗ' }
              ]"
              keyChosen="phường xã"
              v-model="formData.Ward"
            />
          </div>
          <div class="cv__address m-b-8">
            <div class="cv__address_title">Địa chỉ</div>
            <MsInput
              v-model="formData.Address"
              type="text"
              name="cv_address"
              id="cv_address"
              placeholder="Nhập địa chỉ"
              @blur="markTouched('Address')"
              @focus="unMarkTouched('Address')"
              :errorMessages="isTouched('Address') ? errorMessages.Address : ''"
            />
          </div>
          <div class="cv__education m-b-16">
            <div class="cv__education_title">HỌC VẤN</div>
            <div class="cv__education_content">
              <ul>
                <li>
                  <div class="dpl split-2cols m-b-8">
                    <label for="trainning_level" class="trainning_level_title"
                      >Trình độ đào tạo</label
                    >
                    <div class="cv__education_trainning_level dpl">
                      <MsInput
                        v-model="formData.TrainingLevel"
                        type="text"
                        name="trainning_level"
                        id="trainning_level"
                        placeholder="Nhập trình độ đào tạo"
                        @blur="markTouched('TrainingLevel')"
                        @focus="unMarkTouched('TrainingLevel')"
                        :errorMessages="isTouched('TrainingLevel') ? errorMessages.TrainingLevel : ''"
                      />
                      <div class="icon_wrapper__add">
                        <div class="icon__add_blue"></div>
                      </div>
                      <div class="icon_wrapper__dropdown">
                        <div class="icon__dropdown_black"></div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div class="dpl split-2cols m-b-8">
                    <label for="trainning_place" class="trainning_place_title"
                      >Nơi đào tạo</label
                    >
                    <div class="cv__education_trainning_place dpl">
                      <MsInput
                        v-model="formData.TrainingPlace"
                        type="text"
                        name="trainning_place"
                        id="trainning_place"
                        placeholder="Nhập nơi đào tạo"
                        @blur="markTouched('TrainingPlace')"
                        @focus="unMarkTouched('TrainingPlace')"
                        :errorMessages="isTouched('TrainingPlace') ? errorMessages.TrainingPlace : ''"
                      />
                      <div class="icon_wrapper__add">
                        <div class="icon__add_blue"></div>
                      </div>
                      <div class="icon_wrapper__dropdown">
                        <div class="icon__dropdown_black"></div>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div class="dpl split-2cols m-b-8">
                    <label
                      for="trainning_specialized"
                      class="trainning_specialized_title"
                      >Chuyên ngành</label
                    >
                    <div class="cv__education_trainning_specialized dpl">
                      <MsInput
                        v-model="formData.TrainingSpecialize"
                        type="text"
                        name="trainning_specialized"
                        id="trainning_specialized"
                        placeholder="Nhập chuyên ngành"
                        @blur="markTouched('TrainingSpecialize')"
                        @focus="unMarkTouched('TrainingSpecialize')"
                        :errorMessages="isTouched('TrainingSpecialize') ? errorMessages.TrainingSpecialize : ''"
                      />
                      <div class="icon_wrapper__add">
                        <div class="icon__add_blue"></div>
                      </div>
                      <div class="icon_wrapper__dropdown">
                        <div class="icon__dropdown_black"></div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div class="line m-b-16"></div>
          <div class="cv__add_education hvp flex-center-vertical m-b-8">
            <div class="icon_wrapper__add border-none">
              <div class="icon__add_blue"></div>
            </div>
            <div class="cv__add_education_title">Thêm học vấn</div>
          </div>
          <div class="dpl split-2cols m-b-8">
            <div class="cv__applydate col-1">
              <div class="cv__applydate_title">
                Ngày ứng tuyển <span class="color_red">*</span>
              </div>
              <div class="cv_applydate_chosen">
                <MsInput
                  v-model="formData.ApplyDate"
                  type="date"
                  name="cv_applydate"
                  class="hvp"
                  id="cv_applydate"
                />
              </div>
            </div>
            <div class="cv__source_candicate col-1">
              <label
                for="source_candicate"
                class="cv__source_candicate_title hvp"
                >Nguồn ứng viên</label
              >
              <MsSelect
                name="source_candicate"
                id="source_candicate"
                :data="[
                  { value: 'linkedln', label: 'Linkedln' },
                  { value: 'topcv', label: 'TopCV' }
                ]"
                keyChosen="nguồn ứng viên"
                v-model="formData.CandidateSource"
              />
            </div>
          </div>
          <div class="dpl split-2cols m-b-16">
            <div class="cv__personnel col-1">
              <label for="personnel" class="cv__personnel_title hvp"
                >Nhân sự khai thác</label
              >
              <MsSelect
                name="personnel"
                id="personnel"
                :data="[
                  { value: 'dinhthinga', label: 'Đinh Thị Nga' },
                  { value: 'trandanghieu', label: 'Trần Đăng Hiếu' }
                ]"
                keyChosen="nhân sự khai thác"
                v-model="formData.Personnel"
              />
            </div>
            <div class="cv__collaborators col-1">
              <label for="collaborators" class="cv__collaborators_title hvp"
                >Cộng tác viên</label
              >
              <MsSelect
                name="collaborators"
                id="collaborators"
                :data="[
                  { value: 'lethithuha', label: 'Lê Thị Thu Hà' },
                  { value: 'phamvanminh', label: 'Phạm Văn Minh' }
                ]"
                keyChosen="cộng tác viên"
                v-model="formData.Collaborators"
              />
            </div>
          </div>
          <div class="cv__add_faster_member flex-center-vertical hvp m-b-8">
            <MsInput
              type="checkbox"
              name="add_faster_member"
              id="add_faster_member"
            />
            <label for="add_faster_member" class="cv__add_faster_member_title"
              >Thêm nhanh người tham chiếu vào kho ứng tuyển</label
            >
          </div>
          <div class="cv__referrer hvp flex-center-vertical m-b-8">
            <div class="icon_wrapper__add border-none">
              <div class="icon__add_blue"></div>
            </div>
            <div class="cv__referrer_title">Thêm người giới thiệu</div>
          </div>
          <div class="cv__workspace_recently m-b-16">
            <div class="cv__workspace_recently_title">Nơi làm việc gần đây</div>
            <MsInput
              v-model="formData.WorkspaceRecently"
              type="text"
              name="cv_workspace_recently"
              id="cv_workspace_recently"
              placeholder="Nhập nơi làm việc gần đây"
              @blur="markTouched('WorkspaceRecently')"
              @focus="unMarkTouched('WorkspaceRecently')"
              :errorMessages="isTouched('WorkspaceRecently') ? errorMessages.WorkspaceRecently : ''"
            />
          </div>
          <div class="line m-b-16"></div>
          <div class="cv__experience hvp flex-center-vertical m-b-8">
            <div class="icon_wrapper__add border-none">
              <div class="icon__add_blue"></div>
            </div>
            <div class="cv__experience_title">Thêm kinh nghiệm làm việc</div>
          </div>
          <div class="cv__workspace m-b-8">
            <div class="cv__workspace_title">Nơi làm việc</div>
            <MsInput
              v-model="formData.Workspace"
              type="text"
              name="cv_workspace"
              id="cv_workspace"
              placeholder="Nhập nơi làm việc"
              @blur="markTouched('Workspace')"
              @focus="unMarkTouched('Workspace')"
              :errorMessages="isTouched('Workspace') ? errorMessages.Workspace : ''"
            />
          </div>
          <div class="cv__date_work m-b-8">
            <div class="cv__date_work_title">Thời gian</div>
            <div class="dpl split-3cols m-b-8">
              <div class="cv_date_work_chosen col-1">
                <MsInput
                  v-model="formData.DateWorkStart"
                  type="month"
                  name="cv_date_work"
                  class="hvp"
                  id="cv_date_work_start"
                />
              </div>
              <div class="flex-center-vertical h-32">-</div>
              <div class="cv_date_work_chosen col-1">
                <MsInput
                  v-model="formData.DateWorkEnd"
                  type="month"
                  name="cv_date_work"
                  class="hvp"
                  id="cv_date_work_end"
                />
              </div>
            </div>
          </div>
          <div class="cv__workposition m-b-8">
            <div class="cv__workposition_title">Vị trí công việc</div>
            <MsInput
              v-model="formData.WorkPosition"
              type="text"
              name="cv_workposition"
              id="cv_workposition"
              placeholder="Nhập vị trí công việc"
              @blur="markTouched('WorkPosition')"
              @focus="unMarkTouched('WorkPosition')"
              :errorMessages="isTouched('WorkPosition') ? errorMessages.WorkPosition : ''"
            />
          </div>
          <div class="cv__description m-b-8">
            <div class="cv__description_title">Mô tả công việc</div>
            <textarea
              v-model="formData.Description"
              name="cv_description"
              id="cv_description"
              placeholder="Nhập mô tả công việc"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
    <div class="cv__form_footer">
      <div class="cv__form_footer_cancel hvp">Hủy</div>
      <div @click="handleSubmit" class="cv__form_footer_submit hvp">Lưu</div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import MsInput from "@/components/base/MsInput.vue";
import MsSelect from "../../components/base/MsSelect.vue";
/**
 * NOTICE: EMIT + PROP
 */
const emit = defineEmits(["close", "submit", "error"]);
const props = defineProps({
  currentData: Object,
});

/**
 * VARIABLE:
 */
const touchedFields = ref({});

const typeInput = {
  text: "text",
  date: "date",
  select: "select",
  email: "email",
  month: "month",
  file: "file",
};
const formData = ref({
  Avatar: "",
  FullName: "",
  BirthDay: "",
  Gender: "",
  Area: "",
  Phone: "",
  Country: "",
  City: "",
  Ward: "",
  Address: "",
  TrainingLevel: "",
  TrainingPlace: "",
  TrainingSpecialize: "",
  ApplyDate: "",
  CandidateSource: "",
  Personnel: "",
  Collaborators: "",
  WorkspaceRecently: "",
  Workspace: "",
  DateWorkStart: "",
  DateWorkEnd: "",
  WorkPosition: "",
  Description: "",
  Email: "",
});

const avatarSrc = ref("");
let avatarObjectUrl = "";

watch(
  () => formData.value.Avatar,
  (avatar) => {
    if (avatarObjectUrl) {
      URL.revokeObjectURL(avatarObjectUrl);
      avatarObjectUrl = "";
    }
    if (avatar instanceof Blob) {
      avatarObjectUrl = URL.createObjectURL(avatar);
      avatarSrc.value = avatarObjectUrl;
      return;
    }
    if (typeof avatar === "string") {
      avatarSrc.value = avatar;
      return;
    }
    avatarSrc.value = "";
  },
  { immediate: true },
);

const avatarLabel = computed(() => {
  const avatar = formData.value.Avatar;
  if (avatar instanceof File && avatar.name) {
    return avatar.name;
  }
  return "Ảnh";
});

const errorMessages = ref({
  FullName: "Vui lòng nhập họ tên ứng viên",
  BirthDay: "Vui lòng nhập ngày sinh",
  Gender: "Vui lòng chọn giới tính",
  // Area: "Vui lòng chọn khu vực",
  Phone: "Vui lòng nhập số điện thoại hợp lệ",
  Email: "Vui lòng nhập email hợp lệ",
  // Country: "Vui lòng chọn quốc gia",
  // City: "Vui lòng chọn thành phố",
  // Ward: "Vui lòng chọn phường/xã",
  // Address: "Vui lòng nhập địa chỉ",
  // TrainingLevel: "Vui lòng chọn trình độ học vấn",
  // TrainingPlace: "Vui lòng nhập nơi đào tạo",
  // TrainingSpecialize: "Vui lòng nhập chuyên ngành đào tạo",
  // ApplyDate: "Vui lòng nhập ngày ứng tuyển",
  // CandidateSource: "Vui lòng chọn nguồn ứng viên",
  // Personnel: "Vui lòng nhập thông tin nhân sự",
  // Collaborators: "Vui lòng nhập thông tin cộng tác viên",
  // WorkspaceRecently: "Vui lòng nhập nơi làm việc gần đây",
  // Workspace: "Vui lòng nhập nơi làm việc",
  // DateWorkStart: "Vui lòng chọn ngày bắt đầu làm việc",
  // DateWorkEnd: "Vui lòng chọn ngày kết thúc làm việc",
  // WorkPosition: "Vui lòng nhập vị trí công việc",
  // Description: "Vui lòng nhập mô tả công việc",
});

//chuyển file thành base64
const convertFileToBase64 = (file) => {
  if (!(file instanceof Blob)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * NOTICE: Watch
 */
watch(
  () => props.currentData,
  () => {
    if (props.currentData) {
      formData.value = { ...props.currentData };
    }
  },
  { immediate: true }
);

/**
 * FUNCTION:
 */
const unMarkTouched = (field) => {
  touchedFields.value[field] = false;
};
const clearAvatar = () => {
  formData.value.Avatar = "";
};
const markTouched = (field) => {
  const data = formData.value;
  if (field === "Phone") {
    let phonePattern = /^\d{10,11}$/;
    if (!data.Phone) {
      errorMessages.value.Phone = "Số điện thoại không được để trống";
    } else if (!phonePattern.test(data.Phone)) {
      errorMessages.value.Phone = "Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)";
    } else {
      errorMessages.value.Phone = "";
    }
    touchedFields.value[field] = true;
    return;
  }
  if (field === "Email") {
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.Email) {
      errorMessages.value.Email = "Email không được để trống";
    } else if (!emailPattern.test(data.Email)) {
      errorMessages.value.Email = "Vui lòng nhập email hợp lệ";
    } else {
      errorMessages.value.Email = "";
    }
    touchedFields.value[field] = true;
    return;
  }
  if(field === "BirthDay"){
    if(!data.BirthDay) {
      errorMessages.value.BirthDay = "Ngày sinh không được để trống";
    } else {
      const today = new Date();
      const birthDate = new Date(data.BirthDay);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errorMessages.value.BirthDay = "Ứng viên phải từ 18 tuổi trở lên";
      } else {
        errorMessages.value.BirthDay = "";
      }
    }
    touchedFields.value[field] = true;
    return;
  }
  // nếu field rỗng (falsy) thì !""=true => touched, nếu field có giá trị (truthy) thì !"abc"=false => không touched
  touchedFields.value[field] = !data[field];
};

const isTouched = (field) => Boolean(touchedFields.value[field]);

const touchAll = () => {
  const fields = Object.keys(errorMessages.value || {}); //chuyen object errorMessages thanh array
  fields.forEach((field) => {
    touchedFields.value[field] = true;
  });
};

const handleSubmit = async () => {
  touchAll();
  if (!validateForm()) return;
  const defaultAvatar =
    "https://amisplatform.misacdn.net/APIS/PlatformAPI/api/Avatar/3b462ada-17e0-46fb-8cd5-000c082de9be/YZJOBPDB.jpg?avatarID=24412965-9367-4e89-881f-9814b3f2b918&width=64&height=64";
  const avatarBase64 = await convertFileToBase64(formData.value.Avatar);
  let newCandidate = {
    ...formData.value,
    Avatar: avatarBase64 || defaultAvatar,
  };
  emit("submit", newCandidate);
};
const validateForm = () => {
  const data = formData.value;
  //truthy & falsy
  //Falsy - chuoi rong, 0, null, undefined, false, NaN
  if (!data.FullName) {
    console.log(data.FullName);
    emit("error", {
      title: "Lỗi dữ liệu",
      message: "Vui lòng nhập họ tên ứng viên",
      showConfirmButton: false,
    });
    return false;
  }
  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.Email || !emailPattern.test(data.Email)) {
    // alert("Vui lòng nhập email hợp lệ");
    emit("error", {
      title: "Lỗi dữ liệu",
      message: "Vui lòng nhập email hợp lệ",
      showConfirmButton: false,
    });
    return false;
  }
  if (!data.BirthDay) {
    // alert("Vui lòng nhập ngày sinh");
    emit("error", {
      title: "Lỗi dữ liệu",
      message: "Vui lòng nhập ngày sinh",
      showConfirmButton: false,
    });
    return false;
  }
  if (!data.Gender) {
    // alert("Vui lòng chọn giới tính");
    emit("error", {
      title: "Lỗi dữ liệu",
      message: "Vui lòng chọn giới tính",
      showConfirmButton: false,
    });
    return false;
  }
  //   if (!data.Area) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng chọn khu vực", false);
  //     return false;
  //   }
  //   let phonePattern = /^\d{10,11}$/;
  //   if (!data.Phone || !phonePattern.test(data.Phone)) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.Phone) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập số điện thoại", false);
  //     return false;
  //   }
  //   if (!data.Country) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng chọn quốc gia", false);
  //     return false;
  //   }
  //   if (!data.City) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng chọn thành phố", false);
  //     return false;
  //   }
  //   if (!data.Ward) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng chọn phường/xã", false);
  //     return false;
  //   }
  //   if (!data.Address) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập địa chỉ", false);
  //     return false;
  //   }
  //   if (!data.TrainingLevel) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng chọn trình độ học vấn",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.TrainingPlace) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập nơi đào tạo", false);
  //     return false;
  //   }
  //   if (!data.TrainingSpecialize) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập chuyên ngành đào tạo",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.ApplyDate) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập ngày ứng tuyển", false);
  //     return false;
  //   }
  //   if (!data.CandidateSource) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng chọn nguồn ứng viên", false);
  //     return false;
  //   }
  //   if (!data.Personnel) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập nhân sự", false);
  //     return false;
  //   }
  //   if (!data.Collaborators) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập cộng tác viên", false);
  //     return false;
  //   }
  //   if (!data.WorkspaceRecently) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập nơi làm việc gần đây",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.Workspace) {
  //     window.openModalAlert("Lỗi dữ liệu", "Vui lòng nhập nơi làm việc", false);
  //     return false;
  //   }
  //   if (!data.DateWorkStart) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập ngày bắt đầu làm việc",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.DateWorkEnd) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập ngày kết thúc làm việc",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.WorkPosition) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập vị trí công việc",
  //       false
  //     );
  //     return false;
  //   }
  //   if (!data.Description) {
  //     window.openModalAlert(
  //       "Lỗi dữ liệu",
  //       "Vui lòng nhập mô tả công việc",
  //       false
  //     );
  //     return false;
  //   }
  return true;
};
</script>
<style lang=""></style>
