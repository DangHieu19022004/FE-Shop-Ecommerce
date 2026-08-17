<script setup>
import { computed, inject, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import ProductDetailData from "@/data/productDetailData.json";

const Route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").ProductDetail;
const Quantity = ref(1);
const SelectedImageUrl = ref("");
const SelectedVariantId = ref(null);

const Product = computed(() =>
  ProductDetailData.Products.find(
    (ProductItem) => ProductItem.Slug === Route.params.slug && ProductItem.IsActive,
  ),
);
const Category = computed(() =>
  ProductDetailData.Categories.find(
    (CategoryItem) => CategoryItem.CategoryId === Product.value?.CategoryId,
  ),
);
const Brand = computed(() =>
  ProductDetailData.Brands.find((BrandItem) => BrandItem.BrandId === Product.value?.BrandId),
);
const ProductImages = computed(() =>
  ProductDetailData.ProductImages.filter(
    (ImageItem) => ImageItem.ProductId === Product.value?.ProductId,
  ).sort((FirstImage, SecondImage) => FirstImage.SortOrder - SecondImage.SortOrder),
);
const ProductVariants = computed(() =>
  ProductDetailData.ProductVariants.filter(
    (VariantItem) => VariantItem.ProductId === Product.value?.ProductId,
  ),
);
const ProductFeatures = computed(() =>
  ProductDetailData.ProductFeatures.filter(
    (FeatureItem) => FeatureItem.ProductId === Product.value?.ProductId,
  ).sort((FirstFeature, SecondFeature) => FirstFeature.SortOrder - SecondFeature.SortOrder),
);
const ProductGuarantees = computed(() =>
  ProductDetailData.ProductGuarantees.filter(
    (GuaranteeItem) =>
      GuaranteeItem.ProductId === null || GuaranteeItem.ProductId === Product.value?.ProductId,
  ),
);
const RelatedProducts = computed(() => {
  if (!Product.value) return [];
  return ProductDetailData.Products.filter(
    (ProductItem) =>
      ProductItem.ProductId !== Product.value.ProductId &&
      ProductItem.CategoryId === Product.value.CategoryId &&
      ProductItem.IsActive,
  ).slice(0, 3);
});
const DiscountPercent = computed(() => {
  if (!Product.value?.OriginalPrice) return 0;
  return Math.round(
    ((Product.value.OriginalPrice - Product.value.UnitPrice) / Product.value.OriginalPrice) * 100,
  );
});

watch(
  Product,
  (CurrentProduct) => {
    Quantity.value = 1;
    SelectedVariantId.value = ProductVariants.value[0]?.ProductVariantId ?? null;
    SelectedImageUrl.value = CurrentProduct
      ? ProductImages.value.find((ImageItem) => ImageItem.IsPrimary)?.ImageUrl ??
        ProductImages.value[0]?.ImageUrl ??
        ""
      : "";
  },
  { immediate: true },
);

const formatCurrency = (Amount) => {
  if (Amount === null || Amount === undefined) return Text.ContactPrice;
  return new Intl.NumberFormat(Text.CurrencyLocale, {
    style: "currency",
    currency: Text.CurrencyCode,
  }).format(Amount);
};
const formatNumber = (Value) =>
  new Intl.NumberFormat(Text.CurrencyLocale, { notation: "compact" }).format(Value);
const getPrimaryImage = (ProductId) =>
  ProductDetailData.ProductImages.find(
    (ImageItem) => ImageItem.ProductId === ProductId && ImageItem.IsPrimary,
  )?.ImageUrl ?? "";
const changeQuantity = (Delta) => {
  if (!Product.value) return;
  Quantity.value = Math.min(Product.value.StockQuantity, Math.max(1, Quantity.value + Delta));
};
const selectImage = (ImageUrl) => {
  SelectedImageUrl.value = ImageUrl;
};
const selectVariant = (ProductVariantId) => {
  SelectedVariantId.value = ProductVariantId;
};
const navigateToCart = (Checkout) => {
  Router.push({
    name: "cart",
    query: {
      ProductId: Product.value.ProductId,
      ProductVariantId: SelectedVariantId.value,
      Quantity: Quantity.value,
      ...(Checkout ? { Checkout: "true" } : {}),
    },
  });
};
const handleAddToCart = () => navigateToCart(false);
const handleBuyNow = () => navigateToCart(true);
</script>

<template>
  <section v-if="Product" class="product-detail">
    <nav class="product-detail__breadcrumb" :aria-label="Text.BreadcrumbProducts">
      <router-link :to="{ name: 'home' }">{{ Text.BreadcrumbHome }}</router-link>
      <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <router-link :to="{ name: 'productList', query: { CategoryId: Category?.CategoryId } }">
        {{ Category?.CategoryName }}
      </router-link>
      <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <strong>{{ Product.ProductName }}</strong>
    </nav>

    <article class="product-detail__overview dm-card">
      <div class="product-gallery">
        <div class="product-gallery__main">
          <img :src="SelectedImageUrl" :alt="Product.ProductName" />
          <span v-if="DiscountPercent" class="product-gallery__discount">-{{ DiscountPercent }}%</span>
        </div>
        <div class="product-gallery__thumbnails">
          <button
            v-for="ImageItem in ProductImages"
            :key="ImageItem.ProductImageId"
            type="button"
            class="product-gallery__thumbnail"
            :class="{ 'product-gallery__thumbnail--active': SelectedImageUrl === ImageItem.ImageUrl }"
            :aria-label="ImageItem.AltText"
            @click="selectImage(ImageItem.ImageUrl)"
          >
            <img :src="ImageItem.ImageUrl" :alt="ImageItem.AltText" />
          </button>
        </div>
      </div>

      <div class="product-summary">
        <div class="product-summary__heading">
          <div class="product-summary__brand">
            <span class="material-symbols-outlined" aria-hidden="true">verified</span>
            {{ Brand?.BrandName }} · {{ Text.AuthenticBrand }}
          </div>
          <h1>{{ Product.ProductName }}</h1>
          <p>{{ Product.ShortDescription }}</p>
          <div class="product-summary__metrics">
            <span class="product-summary__rating">
              <span class="material-symbols-outlined" aria-hidden="true">star</span>
              {{ Product.RatingAverage }} ({{ Product.ReviewCount }} {{ Text.ReviewLabel }})
            </span>
            <span>{{ formatNumber(Product.SoldQuantity) }} {{ Text.SoldLabel }}</span>
            <span>{{ Product.LocationName }}</span>
          </div>
        </div>

        <div class="product-price">
          <div class="product-price__values">
            <strong>{{ formatCurrency(Product.UnitPrice) }}</strong>
            <del v-if="Product.OriginalPrice > Product.UnitPrice">
              {{ formatCurrency(Product.OriginalPrice) }}
            </del>
          </div>
          <div class="product-price__badges">
            <span class="dm-pill product-price__deal">{{ Text.FlashDeal }}</span>
            <span class="dm-pill product-price__shipping">
              <span class="material-symbols-outlined" aria-hidden="true">local_shipping</span>
              {{ Text.FreeShipping }}
            </span>
          </div>
        </div>

        <div class="product-options">
          <div v-if="ProductVariants.length" class="product-options__row">
            <span class="product-options__label">{{ Text.VariantLabel }}</span>
            <div class="product-options__choices">
              <DMButton
                v-for="VariantItem in ProductVariants"
                :key="VariantItem.ProductVariantId"
                type="none"
                :message="VariantItem.VariantValue"
                :is-tooltip="false"
                class="product-options__choice"
                :class="{ 'product-options__choice--active': SelectedVariantId === VariantItem.ProductVariantId }"
                @click="selectVariant(VariantItem.ProductVariantId)"
              />
            </div>
          </div>
          <div class="product-options__row">
            <span class="product-options__label">{{ Text.QuantityLabel }}</span>
            <div class="product-quantity">
              <DMButton
                type="none"
                :is-tooltip="false"
                class="product-quantity__button"
                :aria-label="Text.DecreaseQuantity"
                :un-active="Quantity <= 1"
                @click="changeQuantity(-1)"
              ><span class="material-symbols-outlined" aria-hidden="true">remove</span></DMButton>
              <strong>{{ Quantity }}</strong>
              <DMButton
                type="none"
                :is-tooltip="false"
                class="product-quantity__button"
                :aria-label="Text.IncreaseQuantity"
                :un-active="Quantity >= Product.StockQuantity"
                @click="changeQuantity(1)"
              ><span class="material-symbols-outlined" aria-hidden="true">add</span></DMButton>
              <span class="product-quantity__stock">
                {{ Product.StockQuantity }} {{ Text.AvailableSuffix }}
              </span>
            </div>
          </div>
        </div>

        <div class="product-actions">
          <DMButton type="none" :message="Text.AddToCart" :is-tooltip="false" class="product-actions__cart" @click="handleAddToCart" />
          <DMButton type="none" :message="Text.BuyNow" :is-tooltip="false" class="product-actions__buy" @click="handleBuyNow" />
        </div>
      </div>
    </article>

    <div class="product-detail__content">
      <article class="product-information dm-card">
        <section>
          <h2>{{ Text.DescriptionTitle }}</h2>
          <p>{{ Product.Description }}</p>
        </section>
        <section v-if="ProductFeatures.length">
          <h2>{{ Text.FeatureTitle }}</h2>
          <dl class="product-features">
            <div v-for="FeatureItem in ProductFeatures" :key="FeatureItem.ProductFeatureId">
              <dt>{{ FeatureItem.FeatureName }}</dt>
              <dd>{{ FeatureItem.FeatureValue }}</dd>
            </div>
          </dl>
        </section>
        <section v-if="RelatedProducts.length">
          <div class="product-information__heading">
            <h2>{{ Text.RelatedTitle }}</h2>
            <router-link :to="{ name: 'productList' }">{{ Text.BackToCatalog }}</router-link>
          </div>
          <div class="related-products">
            <router-link
              v-for="RelatedItem in RelatedProducts"
              :key="RelatedItem.ProductId"
              :to="{ name: 'productDetail', params: { slug: RelatedItem.Slug } }"
              class="related-product dm-card"
            >
              <img :src="getPrimaryImage(RelatedItem.ProductId)" :alt="RelatedItem.ProductName" />
              <div class="related-product__body">
                <strong>{{ RelatedItem.ProductName }}</strong>
                <span>{{ formatCurrency(RelatedItem.UnitPrice) }}</span>
                <small>{{ formatNumber(RelatedItem.SoldQuantity) }} {{ Text.SoldLabel }}</small>
              </div>
            </router-link>
          </div>
        </section>
      </article>

      <aside class="product-protection dm-card">
        <h2>{{ Text.ProtectionTitle }}</h2>
        <div v-for="GuaranteeItem in ProductGuarantees" :key="GuaranteeItem.ProductGuaranteeId" class="product-protection__item">
          <span class="material-symbols-outlined" aria-hidden="true">{{ GuaranteeItem.IconName }}</span>
          <div>
            <strong>{{ GuaranteeItem.GuaranteeTitle }}</strong>
            <p>{{ GuaranteeItem.GuaranteeDescription }}</p>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <section v-else class="product-not-found dm-card">
    <span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>
    <h1>{{ Text.ProductNotFound }}</h1>
    <p>{{ Text.ProductNotFoundDescription }}</p>
    <router-link :to="{ name: 'home' }" class="dm-btn">{{ Text.BackHome }}</router-link>
  </section>
</template>

<style scoped src="@/assets/styles/screens/product-detail.css"></style>
