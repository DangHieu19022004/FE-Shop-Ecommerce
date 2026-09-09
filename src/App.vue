<template>
	<DMAlertStack />
	<DMConfirmDialog />
	<router-view />
</template>

<script setup>
import DMAlertStack from "@/components/base/DMAlertStack.vue";
import DMConfirmDialog from "@/components/base/DMConfirmDialog.vue";
</script>
