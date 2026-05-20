<template lang="">
    <aside :class="[{ sidebar_hide: props.isCollapse },'sidebar']">
            <div class="sbbg">
                <div class="sb__top">
                    <div class="sb__list">
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon sb__recrui_icon m-r-16"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Tin tuyển dụng</div>
                        </router-link>
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon sb__candidate_icon m-r-16"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Ứng viên</div>
                        </router-link>
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16"><i class="fa-regular fa-circle-play"></i></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Demo</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16"><i class="fa-regular fa-calendar"></i></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Lịch</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16 sb__talent_pool_icon"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Kho tiềm năng</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16 sb__recrui_campaign_icon"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Chiến dịch tuyển dụng</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16 sb__task_icon"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Công việc</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16"><i class="fa-regular fa-envelope"></i></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">aiMarketing</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16 sb__report_icon"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Báo cáo</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16 sb__setting_icon"></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Thiết lập</div>
                        </router-link>
    
                        <router-link to="/demo" class="hvp dpl pd-8-12 menu__item">
                            <div class="menu__icon m-r-16"><i class="fa-solid fa-ellipsis"></i></div>
                            <div :class="['menu__text', { menu__text_hide: props.isCollapse }]">Khác</div>
                        </router-link>
                    </div>
                </div>
                <div class="sb__bottom">
                    <div :class="['sb__btn_left hvp', { sb__btn_left_hide: props.isCollapse }]" @click="toggleCollapse">
                        <div :class="['sb__left_icon', { hide_sidebar_btn: props.isCollapse }]"></div>
                        <div :class="['sb__left_title m-l-8', { sb__left_title_hide: props.isCollapse }]">Thu gọn</div>
                    </div>
                </div>

            </div>
        </aside>
</template>
<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps(['isCollapse']);
const emit = defineEmits(['update:isCollapse'])
const toggleCollapse = () => {
    emit('update:isCollapse', !props.isCollapse);
}
</script>
<style scoped>
.sidebar {
    width: 233px;
    background-color: #051529;
    background-image: url();
    background-position: bottom;
    background-repeat: no-repeat;
    background-size: cover;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.sbbg {
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    padding-top: 32px;
    padding-bottom: 16px;
    display: flex;
    flex-direction: column;
}

.sb__top {
    flex: 1;
}

.sb__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-content: center;
    height: calc(100% - 56px);
    margin-left: 12px;
}

.menu__item {
    display: flex;
    align-items: center;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    transition: all 0.2s ease;
}

.menu__item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
}

.menu__icon {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    font-size: 22px;
}

.menu__text {
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
}

.sb__bottom {
    height: 40px;
    display: flex;
    justify-content: center;
}

.sb__btn_left {
    background-color: rgba(255, 255, 255, 0.1);
    border: 0.5px solid #fff;
    border-radius: 4px;
    padding: 8px;
    width: 200px;
    color: #fff;
    display: flex;
}

.hide_sidebar_btn {
    transform: rotate(180deg);
}

.sb__left_title_hide,
.menu__text_hide {
    display: none;
}

.sidebar.sidebar_hide {
    width: 80px;
}

.sb__btn_left_hide {
    width: 40px;
}
</style>