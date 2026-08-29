<script setup>
import { computed, inject, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import DMInput from "@/components/base/DMInput.vue";
import { createMyAddress, deleteMyAddress, getCurrentSession, getMyAddresses, logoutUser, updateMyAddress } from "@/services/authService";
import { formatAddress } from "@/utils/shopFormatters";

const Text = inject("i18nCommon").Profile;
const Router = useRouter();
const SessionData = getCurrentSession();
const Addresses = ref([]);
const EditingAddressId = ref("");
const AddressMessage = ref("");
const AddressErrorMessage = ref("");
const AddressForm = reactive({ RecipientName: "", PhoneNumber: "", AddressLine: "", Ward: "", District: "", Province: "", IsDefault: false });
const DisplayName = computed(() => SessionData?.FullName || Text.EmptyValue);
const AvatarLetter = computed(() => DisplayName.value.charAt(0).toUpperCase());

const loadAddresses = async () => {
  try {
    AddressErrorMessage.value = "";
    Addresses.value = await getMyAddresses();
  } catch (Error) {
    AddressErrorMessage.value = Error.message;
  }
};

const resetAddressForm = () => {
  EditingAddressId.value = "";
  AddressForm.RecipientName = "";
  AddressForm.PhoneNumber = "";
  AddressForm.AddressLine = "";
  AddressForm.Ward = "";
  AddressForm.District = "";
  AddressForm.Province = "";
  AddressForm.IsDefault = false;
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
};

const submitAddress = async () => {
  if (!AddressForm.RecipientName.trim() || !AddressForm.PhoneNumber.trim() || !AddressForm.AddressLine.trim()) {
    AddressErrorMessage.value = "Nhập đủ người nhận, số điện thoại, địa chỉ.";
    return;
  }

  try {
    AddressErrorMessage.value = "";
    AddressMessage.value = "";
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
      AddressMessage.value = "Đã tạo địa chỉ.";
    }

    resetAddressForm();
    await loadAddresses();
  } catch (Error) {
    AddressErrorMessage.value = Error.message;
  }
};

const removeAddress = async (AddressId) => {
  try {
    AddressErrorMessage.value = "";
    await deleteMyAddress(AddressId);
    AddressMessage.value = "Đã xóa địa chỉ.";
    if (EditingAddressId.value === AddressId) resetAddressForm();
    await loadAddresses();
  } catch (Error) {
    AddressErrorMessage.value = Error.message;
  }
};

const handleLogout = async () => {
  await logoutUser();
  Router.replace({ name: "login" });
};

onMounted(loadAddresses);
</script>

<template>
  <section class="profile-page">
    <header class="profile-page__header">
      <div>
        <p class="profile-page__eyebrow">{{ Text.BrandName }}</p>
        <h1>{{ Text.PageTitle }}</h1>
        <p>{{ Text.PageSubtitle }}</p>
      </div>
      <DMButton type="none" :is-tooltip="false" class="profile-page__logout" icon-name="logout" :message="Text.LogoutButton" @click="handleLogout" />
    </header>

    <div class="profile-page__grid">
      <article class="profile-summary dm-card">
        <div class="profile-summary__avatar" aria-hidden="true">{{ AvatarLetter }}</div>
        <div>
          <h2>{{ DisplayName }}</h2>
          <p>{{ SessionData?.Email || Text.EmptyValue }}</p>
        </div>
      </article>

      <article class="profile-details dm-card">
        <h2>{{ Text.AccountSectionTitle }}</h2>
        <dl class="profile-details__list">
          <div>
            <dt>{{ Text.FullNameLabel }}</dt>
            <dd>{{ DisplayName }}</dd>
          </div>
          <div>
            <dt>{{ Text.EmailLabel }}</dt>
            <dd>{{ SessionData?.Email || Text.EmptyValue }}</dd>
          </div>
          <div>
            <dt>{{ Text.PhoneLabel }}</dt>
            <dd>{{ SessionData?.Phone || Text.EmptyValue }}</dd>
          </div>
        </dl>
      </article>

      <article class="profile-details dm-card" style="grid-column: 1 / -1;">
        <div style="display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap;">
          <h2>Địa chỉ giao hàng</h2>
          <DMButton type="none" :is-tooltip="false" class="profile-page__logout" @click="resetAddressForm">{{ EditingAddressId ? 'Tạo địa chỉ mới' : 'Xóa form' }}</DMButton>
        </div>
        <div v-if="AddressErrorMessage" style="margin-top: 16px; color: var(--dm-danger);">{{ AddressErrorMessage }}</div>
        <div v-if="AddressMessage" style="margin-top: 16px; color: var(--dm-primary);">{{ AddressMessage }}</div>
        <div class="profile-address-grid" style="margin-top: 16px;">
          <div style="display: grid; gap: 12px;">
            <DMInput v-model="AddressForm.RecipientName" label="Người nhận" />
            <DMInput v-model="AddressForm.PhoneNumber" label="Số điện thoại" />
            <DMInput v-model="AddressForm.AddressLine" label="Địa chỉ" />
            <DMInput v-model="AddressForm.Ward" label="Phường/Xã" />
            <DMInput v-model="AddressForm.District" label="Quận/Huyện" />
            <DMInput v-model="AddressForm.Province" label="Tỉnh/Thành" />
            <label style="display: flex; gap: 8px; align-items: center;"><input v-model="AddressForm.IsDefault" type="checkbox" /> Đặt làm mặc định</label>
            <DMButton type="none" :is-tooltip="false" class="dm-btn" @click="submitAddress">{{ EditingAddressId ? 'Lưu địa chỉ' : 'Tạo địa chỉ' }}</DMButton>
          </div>
          <div style="display: grid; gap: 12px; align-content: start;">
            <article v-for="Address in Addresses" :key="Address.UserAddressId" class="dm-card" style="padding: 16px; border: 1px solid var(--dm-border);">
              <strong>{{ Address.RecipientName }} · {{ Address.PhoneNumber }}</strong>
              <p style="margin: 8px 0;">{{ formatAddress(Address) }}</p>
              <small v-if="Address.IsDefault">Mặc định</small>
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
                <DMButton type="none" :is-tooltip="false" class="dm-btn" @click="startEditAddress(Address)">Sửa</DMButton>
                <DMButton type="none" :is-tooltip="false" class="profile-page__logout" @click="removeAddress(Address.UserAddressId)">Xóa</DMButton>
              </div>
            </article>
            <p v-if="!Addresses.length" style="margin: 0; color: var(--dm-text-soft);">Chưa có địa chỉ nào.</p>
          </div>
        </div>
      </article>

      <aside class="profile-coming-soon dm-card">
        <span class="material-symbols-outlined" aria-hidden="true">construction</span>
        <div>
          <h2>{{ Text.ComingSoonTitle }}</h2>
          <p>{{ Text.ComingSoonDescription }}</p>
        </div>
      </aside>

      <article class="profile-details dm-card" style="grid-column: 1 / -1;">
        <h2>Tiện ích Phase 13</h2>
        <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-top: 16px;">
          <router-link :to="{ name: 'myReviews' }" class="dm-btn">Đánh giá của tôi</router-link>
          <router-link :to="{ name: 'loyalty' }" class="dm-btn">Điểm thưởng</router-link>
          <router-link :to="{ name: 'notifications' }" class="dm-btn">Thông báo</router-link>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped src="@/assets/styles/screens/profile.css"></style>
