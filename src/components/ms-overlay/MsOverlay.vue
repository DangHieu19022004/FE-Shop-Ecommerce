<template lang="">
<div class="overlay" @click="emit('click')"></div>
</template>
<script setup>
const emit = defineEmits(["click"]);
</script>