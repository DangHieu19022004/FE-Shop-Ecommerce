<template>
    <header class="navbar">
        <div class="bgnv">
            <div class="navbar__header">
                <div class="navbar__header_left">
                    <div class="navbar__title">
                        Title
                    </div>
                </div>
                <div class="navbar__header_right">
                    <div class="hvp m-l-16">
                        <img
                            class="navbar__user_icon"
                            src="https://amisplatform.misacdn.net/APIS/PlatformAPI/api/Avatar/3b462ada-17e0-46fb-8cd5-000c082de9be/YZJOBPDB.jpg?avatarID=24412965-9367-4e89-881f-9814b3f2b918&width=64&height=64"
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

</script>
<style scoped>
.navbar {
    height: 48px;
    width: 100%;
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
}


.navbar__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    margin-left: 16px;
    margin-right: 16px;
}

.navbar__header_left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.navbar__title {
    font-weight: 700;
}
.navbar__user_icon {
    border-radius: 50%;
    width: 32px;
    height: 32px;
}
</style>