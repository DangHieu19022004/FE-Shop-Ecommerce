<template>
    <header class="navbar">
        <div class="bgnv">
            <div class="navbar__header">
                <div class="navbar__header_left">
                    <MsIcon
                        message="Tất cả ứng dụng"
                        class="mi-ninedot-white hvp icon--sm"
                        shape="circle"
                    />
                    <div class="mi-payroll-logo hvp icon--lg"></div>
                    <div class="payroll-header">Tiền lương</div>
                </div>
                <div class="navbar__header_right">
                    <div class="hvp navbar__search">
                        <MsIcon
                            class="mi-search-white icon--base"
                            background
                        />
                        <MsInput
                            placeholder="Tìm kiếm"
                            class="navbar__search-input"
                        />
                    </div>
                    <MsIcon
                        message="Thiết lập"
                        class="mi-setting-white hvp"
                        shape="circle"
                    />
                    <MsIcon
                        class="mi-agent-box hvp"
                        background
                    />
                    <MsIcon
                        message="Tính năng mới"
                        class="mi-new-feature-white hvp"
                        shape="circle"
                    />
                    <MsIcon
                        message="Tin nhắn"
                        class="mi-chat hvp"
                        shape="circle"
                    />
                    <MsIcon
                        message="Thông báo"
                        class="mi-alert hvp"
                        shape="circle"
                    />
                    <MsIcon
                        message="Trợ giúp"
                        class="mi-ask hvp"
                        shape="circle"
                    />
                    <MsIcon
                        message="Tính năng khác"
                        class="mi-other-feat hvp"
                        shape="circle"
                    />
                    <MsIcon
                        message="Kiến thức hữu ích"
                        class="mi-book hvp"
                        shape="circle"
                    />
                    <div class="hvp navbar__user">
                        <div class="missing-avatar">
                            2
                        </div>
                        <img
                            class="navbar__user_icon"
                            src="https://testcdnamisapp.misacdn.net/APIS/PlatformAPI/api/Avatar/44660afe-149e-4984-9e3c-21fedc82d344/T8UM3JZX.jpg?avatarID=f552c9cb-f42c-419b-9d7a-2304e5f5e8e8&width=64&height=64"
                            alt=""
                            loading="lazy"
                        >
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
<script setup>
import MsIcon from "@/components/base/MsIcon.vue";
import MsInput from "@/components/base/MsInput.vue";

</script>
<style scoped>
.navbar {
    height: 48px;
    width: 100%;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background-color:rgb(14, 154, 98);
}

.bgnv{
    height: 100%;
}

.navbar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    margin-left: 8px;
    margin-right: 8px;
}

.navbar__header_left {
    display: flex;
    align-items: center;
    gap: 4px;
}

.navbar__header_right{
    display: flex;
    align-items: center;
    gap: 8px;
}

.navbar__user_icon {
    border-radius: 50%;
    width: 26px;
    height: 26px;
    border: 1px solid #fff;
}

.payroll-header{
    margin-left: 8px;
    font-size: 18px;
    color: #fff;
    font-weight: 700;
}

.navbar__search {
    display: flex;
    align-items: center;
    background-color: #fff3;
    border-radius: 4px;
    width: 300px;
    height: 32px;
}

.navbar__user {
    width: 32px;
    height: 32px;
    background: conic-gradient(rgb(65, 146, 255) 60%, rgb(245, 34, 45) 60%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.missing-avatar {
    width: 16px;
    height: 16px;
    top: 5px;
    right: 5px;
    z-index: 1;
    font-size: 10px;
    line-height: 16px;
    position: absolute;
    background: #f5222d;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    box-sizing: border-box;
    font-weight: 700;
}

:deep(.ms-input-in.navbar__search-input) {
    color: #E0E0E0;
    background-color: transparent;
    border: none;
}

:deep(.ms-input-in.navbar__search-input::placeholder) {
    color: #E0E0E0;
}

:deep(.ms-input-in.navbar__search-input:focus) {
    border: none;
    outline: none;
    box-shadow: none;
}
</style>