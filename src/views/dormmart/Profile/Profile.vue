<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import {
  createMyAddress,
  deleteMyAddress,
  getCurrentSession,
  getMyAddresses,
  getMyProfile,
  logoutUser,
  updateMyAddress,
} from "@/services/authService";
import { confirmDelete } from "@/stores/confirmStore";
import { formatAddress } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").Profile;
const Router = useRouter();
const SessionData = getCurrentSession();
const ProfileData = ref({ ...(SessionData || {}) });
const Addresses = ref([]);
const IsLoading = ref(true);
const IsAddressFormOpen = ref(false);
const IsSavingAddress = ref(false);
const DeletingAddressId = ref("");
const EditingAddressId = ref("");
const ProfileErrorMessage = ref("");
const AddressMessage = ref("");
const AddressErrorMessage = ref("");
const AddressForm = reactive({ RecipientName: "", PhoneNumber: "", AddressLine: "", Ward: "", District: "", Province: "", IsDefault: false });

const DisplayName = computed(() => ProfileData.value?.FullName || Text.EmptyValue);
const DisplayEmail = computed(() => ProfileData.value?.Email || Text.EmptyValue);
const DisplayPhone = computed(() => ProfileData.value?.Phone || ProfileData.value?.PhoneNumber || Text.EmptyValue);
const AvatarLetter = computed(() => DisplayName.value === Text.EmptyValue ? "U" : DisplayName.value.charAt(0).toUpperCase());
const AddressFormTitle = computed(() => EditingAddressId.value ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới");

const QuickLinks = [
  { Name: "orderHistory", Icon: "receipt_long", Label: "Đơn mua", Description: "Theo dõi và xem lại đơn hàng" },
  { Name: "notifications", Icon: "notifications", Label: "Thông báo", Description: "Cập nhật mới từ Dorm Mart" },
  { Name: "loyalty", Icon: "stars", Label: "Điểm thưởng", Description: "Kiểm tra số dư và lịch sử điểm" },
  { Name: "myReviews", Icon: "reviews", Label: "Đánh giá của tôi", Description: "Quản lý đánh giá sản phẩm" },
];

const loadAddresses = async () => {
  try {
    AddressErrorMessage.value = "";
    Addresses.value = await getMyAddresses();
  } catch (Error) {
    AddressErrorMessage.value = Error.message;
  }
};

const loadProfile = async () => {
  IsLoading.value = true;
  ProfileErrorMessage.value = "";

  try {
    const LatestProfile = await getMyProfile();
    ProfileData.value = { ...(SessionData || {}), ...(LatestProfile || {}) };
  } catch (Error) {
    ProfileErrorMessage.value = Error.message;
  }

  await loadAddresses();
  IsLoading.value = false;
};

const clearAddressForm = () => {
  EditingAddressId.value = "";
  AddressForm.RecipientName = "";
  AddressForm.PhoneNumber = "";
  AddressForm.AddressLine = "";
  AddressForm.Ward = "";
  AddressForm.District = "";
  AddressForm.Province = "";
  AddressForm.IsDefault = false;
};

const openCreateAddress = () => {
  clearAddressForm();
  AddressMessage.value = "";
  AddressErrorMessage.value = "";
  IsAddressFormOpen.value = true;
};

const closeAddressForm = () => {
  clearAddressForm();
  IsAddressFormOpen.value = false;
};

const startEditAddress = (Address) => {
  EditingAddressId.value = Address.UserAddressId;
  AddressForm.RecipientName = Address.RecipientName || "";
  AddressForm.PhoneNumber = Address.PhoneNumber || "";
  AddressForm.AddressLine = Address.AddressLine || "";
  AddressForm.Ward = Address.Ward || "";
  AddressForm.District = Address.District || "";
  AddressForm.Province = Address.Province || "";
  AddressForm.IsDefault = Boolean(Address.IsDefault);
  AddressMessage.value = "";
  AddressErrorMessage.value = "";
  IsAddressFormOpen.value = true;
};

const submitAddress = async () => {
  if (!AddressForm.RecipientName.trim() || !AddressForm.PhoneNumber.trim() || !AddressForm.AddressLine.trim()) {
    AddressErrorMessage.value = "Vui lòng nhập người nhận, số điện thoại và địa chỉ.";
    return;
  }

  IsSavingAddress.value = true;
  AddressErrorMessage.value = "";
  AddressMessage.value = "";

  try {
    const Payload = {
      RecipientName: AddressForm.RecipientName.trim(),
      PhoneNumber: AddressForm.PhoneNumber.trim(),
      AddressLine: AddressForm.AddressLine.trim(),
      Ward: AddressForm.Ward.trim() || null,
      District: AddressForm.District.trim() || null,
      Province: AddressForm.Province.trim() || null,
      IsDefault: AddressForm.IsDefault,
    };

    if (EditingAddressId.value) {
      await updateMyAddress(EditingAddressId.value, Payload);
      AddressMessage.value = "Đã cập nhật địa chỉ.";
    } else {
      await createMyAddress(Payload);
      AddressMessage.value = "Đã thêm địa chỉ mới.";
    }

    closeAddressForm();
    await loadAddresses();
  } catch (Error) {
    AddressErrorMessage.value = Error.message;
  } finally {
    IsSavingAddress.value = false;
  }
};

const removeAddress = async (Address) => {
  if (!await confirmDelete(`Xóa địa chỉ của ${Address.RecipientName}?`)) return;

  DeletingAddressId.value = Address.UserAddressId;
  AddressErrorMessage.value = "";
  AddressMessage.value = "";

  try {
    await deleteMyAddress(Address.UserAddressId);
    AddressMessage.value = "Đã xóa địa chỉ.";
    if (EditingAddressId.value === Address.UserAddressId) closeAddressForm();
    await loadAddresses();
  } catch (Error) {
    AddressErrorMessage.value = Error.message;
  } finally {
    DeletingAddressId.value = "";
  }
};

const handleLogout = async () => {
  await logoutUser();
  Router.replace({ name: "login" });
};

onMounted(loadProfile);
</script>

<template>
  <section class="profile-page">
    <header class="profile-page__header">
      <div>
        <h1>{{ Text.PageTitle }}</h1>
        <p>{{ Text.PageSubtitle }}</p>
      </div>
      <DMButton type="none" :is-tooltip="false" class="profile-page__logout" icon-name="logout" :message="Text.LogoutButton" @click="handleLogout" />
    </header>

    <div v-if="ProfileErrorMessage" class="profile-alert profile-alert--error" role="alert">{{ ProfileErrorMessage }}</div>

    <div v-if="IsLoading" class="profile-loading dm-card" aria-live="polite">
      <span class="material-symbols-outlined" aria-hidden="true">progress_activity</span>
      Đang tải thông tin tài khoản...
    </div>

    <div v-else class="profile-layout">
      <aside class="profile-layout__aside">
        <article class="profile-account dm-card">
          <div class="profile-account__identity">
            <div class="profile-summary__avatar" aria-hidden="true">{{ AvatarLetter }}</div>
            <div class="profile-account__heading">
              <h2>{{ DisplayName }}</h2>
              <p>{{ DisplayEmail }}</p>
            </div>
          </div>
          <DMBadge success dot>Tài khoản đang hoạt động</DMBadge>
          <dl class="profile-account__details">
            <div><dt>{{ Text.FullNameLabel }}</dt><dd>{{ DisplayName }}</dd></div>
            <div><dt>{{ Text.EmailLabel }}</dt><dd>{{ DisplayEmail }}</dd></div>
            <div><dt>{{ Text.PhoneLabel }}</dt><dd>{{ DisplayPhone }}</dd></div>
          </dl>
        </article>

        <nav class="profile-shortcuts dm-card" aria-label="Tiện ích tài khoản">
          <h2>Tiện ích tài khoản</h2>
          <router-link v-for="Item in QuickLinks" :key="Item.Name" :to="{ name: Item.Name }" class="profile-shortcut">
            <span class="material-symbols-outlined profile-shortcut__icon" aria-hidden="true">{{ Item.Icon }}</span>
            <span class="profile-shortcut__content"><strong>{{ Item.Label }}</strong><small>{{ Item.Description }}</small></span>
            <span class="material-symbols-outlined profile-shortcut__arrow" aria-hidden="true">chevron_right</span>
          </router-link>
        </nav>
      </aside>

      <main class="profile-layout__main">
        <article class="profile-addresses dm-card">
          <div class="profile-section-heading">
            <div>
              <h2>Địa chỉ giao hàng</h2>
              <p>{{ Addresses.length ? `${Addresses.length} địa chỉ đã lưu` : 'Thêm địa chỉ để thanh toán nhanh hơn' }}</p>
            </div>
            <DMButton type="none" :is-tooltip="false" class="dm-btn profile-addresses__add" icon-name="add" message="Thêm địa chỉ" @click="openCreateAddress" />
          </div>

          <div v-if="AddressErrorMessage" class="profile-alert profile-alert--error" role="alert">{{ AddressErrorMessage }}</div>
          <div v-if="AddressMessage" class="profile-alert profile-alert--success" role="status">{{ AddressMessage }}</div>

          <form v-if="IsAddressFormOpen" class="profile-address-form" @submit.prevent="submitAddress">
            <div class="profile-address-form__heading">
              <div>
                <h3>{{ AddressFormTitle }}</h3>
                <p>Thông tin có dấu * là bắt buộc.</p>
              </div>
              <DMButton type="none" :is-tooltip="false" icon-name="close" aria-label="Đóng form địa chỉ" @click="closeAddressForm" />
            </div>
            <div class="profile-address-form__grid">
              <DMInput v-model="AddressForm.RecipientName" label="Người nhận" :is-required="true" />
              <DMInput v-model="AddressForm.PhoneNumber" label="Số điện thoại" type="tel" inputmode="tel" :is-required="true" />
              <div class="profile-address-form__full"><DMInput v-model="AddressForm.AddressLine" label="Địa chỉ" :is-required="true" /></div>
              <DMInput v-model="AddressForm.Ward" label="Phường/Xã" />
              <DMInput v-model="AddressForm.District" label="Quận/Huyện" />
              <DMInput v-model="AddressForm.Province" label="Tỉnh/Thành phố" />
            </div>
            <label class="profile-address-form__default"><input v-model="AddressForm.IsDefault" type="checkbox" /> Đặt làm địa chỉ mặc định</label>
            <div class="profile-address-form__actions">
              <DMButton native-type="submit" type="none" :is-tooltip="false" class="dm-btn" :message="IsSavingAddress ? 'Đang lưu...' : (EditingAddressId ? 'Lưu thay đổi' : 'Lưu địa chỉ')" :un-active="IsSavingAddress" />
              <DMButton type="none" :is-tooltip="false" message="Hủy" @click="closeAddressForm" />
            </div>
          </form>

          <div v-if="Addresses.length" class="profile-address-list">
            <article v-for="Address in Addresses" :key="Address.UserAddressId" class="profile-address-card">
              <div class="profile-address-card__icon"><span class="material-symbols-outlined" aria-hidden="true">home</span></div>
              <div class="profile-address-card__content">
                <div class="profile-address-card__heading">
                  <strong>{{ Address.RecipientName }}</strong>
                  <DMBadge v-if="Address.IsDefault" primary dot>Mặc định</DMBadge>
                </div>
                <p>{{ Address.PhoneNumber }}</p>
                <address>{{ formatAddress(Address) }}</address>
              </div>
              <div class="profile-address-card__actions">
                <DMButton type="none" :is-tooltip="false" icon-name="edit" message="Sửa" @click="startEditAddress(Address)" />
                <DMButton type="none" :is-tooltip="false" class="profile-address-card__delete" icon-name="delete" :message="DeletingAddressId === Address.UserAddressId ? 'Đang xóa...' : 'Xóa'" :un-active="Boolean(DeletingAddressId)" @click="removeAddress(Address)" />
              </div>
            </article>
          </div>

          <div v-else class="profile-address-empty">
            <span class="material-symbols-outlined" aria-hidden="true">location_on</span>
            <h3>Chưa có địa chỉ giao hàng</h3>
            <p>Lưu địa chỉ thường dùng để đặt hàng nhanh và chính xác hơn.</p>
            <DMButton type="none" :is-tooltip="false" class="dm-btn" icon-name="add" message="Thêm địa chỉ đầu tiên" @click="openCreateAddress" />
          </div>
        </article>
      </main>
    </div>
  </section>
</template>

<style scoped lang="scss" src="@/assets/styles/screens/profile.scss"></style>
