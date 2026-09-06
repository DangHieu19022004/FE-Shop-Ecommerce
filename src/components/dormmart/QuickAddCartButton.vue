<template>
  <DMButton type="none" :is-tooltip="false" class="quick-add-cart quick-add-cart--compact" icon-name="add" :aria-label="Text.QuickAddCart" :un-active="IsAnimating" @click="handleQuickAdd" />
</template>

<script setup>
import { inject, ref } from "vue";
import DMButton from "@/components/base/DMButton.vue";
import { addProductToCart } from "@/stores/cartStore";

const Props = defineProps({
  ProductSlug: { type: String, default: "" },
  ProductVariantId: { type: String, default: "" },
  ImageUrl: { type: String, default: "" },
});
const Text = inject("i18nCommon").Common;
const IsAnimating = ref(false);

const animateToCart = (SourceElement) => {
  const CartTarget = document.querySelector(".dm-cart-button");
  if (!CartTarget || !Props.ImageUrl || !SourceElement) return Promise.resolve();
  const SourceRect = SourceElement.getBoundingClientRect();
  const TargetRect = CartTarget.getBoundingClientRect();
  const FlyingImage = document.createElement("img");
  FlyingImage.src = Props.ImageUrl;
  FlyingImage.alt = "";
  FlyingImage.className = "quick-cart-animation";
  FlyingImage.style.setProperty("--quick-cart-start-x", `${SourceRect.left}px`);
  FlyingImage.style.setProperty("--quick-cart-start-y", `${SourceRect.top}px`);
  FlyingImage.style.setProperty("--quick-cart-end-x", `${TargetRect.left}px`);
  FlyingImage.style.setProperty("--quick-cart-end-y", `${TargetRect.top}px`);
  FlyingImage.style.setProperty("--quick-cart-mid-x", `${(SourceRect.left + TargetRect.left) / 2}px`);
  FlyingImage.style.setProperty("--quick-cart-mid-y", `${Math.min(SourceRect.top, TargetRect.top) - 100}px`);
  document.body.appendChild(FlyingImage);
  return new Promise((Resolve) => {
    FlyingImage.addEventListener("animationend", () => {
      FlyingImage.remove();
      CartTarget.classList.add("dm-cart-button--bump");
      setTimeout(() => CartTarget.classList.remove("dm-cart-button--bump"), 420);
      Resolve();
    }, { once: true });
  });
};

const handleQuickAdd = async (Event) => {
  if (IsAnimating.value) return;
  IsAnimating.value = true;

  try {
    await addProductToCart({ ProductSlug: Props.ProductSlug, ProductVariantId: Props.ProductVariantId });
    await animateToCart(Event.currentTarget);
  } finally {
    IsAnimating.value = false;
  }
};
</script>

<style scoped>
.quick-add-cart--compact {
  transform: scale(0.82);
  transform-origin: center right;
}
</style>
