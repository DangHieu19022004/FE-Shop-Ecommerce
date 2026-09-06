<template>
  <section v-if="IsLoading" class="dm-card" style="padding: 24px; text-align: center;">Đang tải sản phẩm...</section>
  <section v-else-if="Product" class="product-detail">
    <nav class="product-detail__breadcrumb" :aria-label="Text.BreadcrumbProducts">
      <router-link :to="{ name: 'home' }">{{ Text.BreadcrumbHome }}</router-link>
      <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <router-link :to="{ name: 'productList', query: { CategoryId: Product.CategoryId } }">
        {{ Category }}
      </router-link>
      <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      <strong>{{ Product.Name }}</strong>
    </nav>

    <div v-if="ActionMessage" class="dm-card" style="padding: 16px; margin-bottom: 16px; color: var(--dm-primary);">{{ ActionMessage }}</div>

    <article class="product-detail__overview dm-card">
      <div class="product-gallery">
        <div class="product-gallery__main">
          <img :src="SelectedImageUrl" :alt="Product.Name" />
          <DMBadge v-if="HasDiscount" error class="product-gallery__discount">-{{ DiscountPercent }}%</DMBadge>
          <DMBadge :type="IsAvailable ? 'success' : 'error'" class="product-gallery__status" dot>
            {{ AvailabilityText }}
          </DMBadge>
        </div>
        <div v-if="ProductImages.length" class="product-gallery__thumbnails">
          <button
            v-for="ImageItem in ProductImages"
            :key="ImageItem.ProductImageId"
            type="button"
            class="product-gallery__thumbnail"
            :class="{ 'product-gallery__thumbnail--active': SelectedImageUrl === ImageItem.ImageUrl }"
            :aria-label="ImageItem.AltText || Product.Name"
            @click="SelectedImageUrl = ImageItem.ImageUrl"
          >
            <img :src="ImageItem.ImageUrl" :alt="ImageItem.AltText || Product.Name" />
          </button>
        </div>
      </div>

      <div class="product-summary">
        <div class="product-summary__heading">
          <div class="product-summary__brand-row">
            <div class="product-summary__brand">
              <span class="material-symbols-outlined" aria-hidden="true">verified</span>
              {{ formatI18nText(Text.AuthenticBrandWithName, { brand: BrandName }) }}
            </div>
            <div v-if="ReviewSummary" class="product-summary__rating">
              <span class="material-symbols-outlined" aria-hidden="true">star</span>
              {{ ReviewLabel }}
            </div>
          </div>
          <h1>{{ Product.Name }}</h1>
          <p>{{ Product.ShortDescription || Product.Description }}</p>
          <div v-if="ProductMetrics.length" class="product-summary__metrics">
            <span v-for="MetricItem in ProductMetrics" :key="MetricItem.Label">
              <strong>{{ MetricItem.Label }}:</strong> {{ MetricItem.Value }}
            </span>
          </div>
        </div>

        <div class="product-price">
          <div class="product-price__values">
            <del v-if="HasDiscount">
              {{ OldPriceText }}
            </del>
            <strong>
              {{ Product.MinSalePrice > 0 ? CurrentPriceText : Text.ContactPrice }}
            </strong>
          </div>
          <div class="product-price__badges">
            <DMBadge v-if="HasDiscount" error icon-name="bolt">{{ Text.FlashDeal }} -{{ DiscountPercent }}%</DMBadge>
            <DMBadge success icon-name="local_shipping">
              {{ Text.FreeShipping }}
            </DMBadge>
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
                :message="VariantItem.Name"
                :is-tooltip="false"
                class="product-options__choice"
                :class="{ 'product-options__choice--active': SelectedVariantId === VariantItem.ProductVariantId }"
                @click="SelectedVariantId = VariantItem.ProductVariantId"
              />
            </div>
          </div>
          <div class="product-options__row">
            <span class="product-options__label">{{ Text.QuantityLabel }}</span>
            <div class="product-quantity">
              <DMButton type="none" :is-tooltip="false" class="product-quantity__button" icon-name="remove" :aria-label="Text.DecreaseQuantity" :un-active="Quantity <= 1 || !CanAddToCart" @click="changeQuantity(-1)" />
              <strong>{{ Quantity }}</strong>
              <DMButton type="none" :is-tooltip="false" class="product-quantity__button" icon-name="add" :aria-label="Text.IncreaseQuantity" :un-active="!CanIncreaseQuantity" @click="changeQuantity(1)" />
            </div>
          </div>
        </div>

        <div class="product-actions">
          <DMButton type="none" icon-name="add_shopping_cart" :message="Text.AddToCart" :is-tooltip="false" class="product-actions__cart" :un-active="!CanAddToCart" @click="handleAddToCart(false)" />
          <DMButton type="none" icon-name="shopping_bag" :message="Text.BuyNow" :is-tooltip="false" class="product-actions__buy" :un-active="!CanAddToCart" @click="handleAddToCart(true)" />
        </div>
      </div>
    </article>

    <div class="product-detail__content">
      <article class="product-information dm-card">
        <section>
          <div class="product-information__section-heading">
            <h2>{{ Text.DescriptionTitle }}</h2>
          </div>
          <p>{{ Product.Description || Product.ShortDescription || 'Chưa có mô tả.' }}</p>
        </section>
        <section v-if="ReviewSummary">
          <div class="product-information__heading">
            <h2>Đánh giá sản phẩm</h2>
            <span>{{ ReviewLabel }}</span>
          </div>
          <div v-if="ReviewSummary.Reviews?.length" class="product-reviews">
            <article v-for="ReviewItem in ReviewSummary.Reviews" :key="ReviewItem.ReviewId" class="product-review dm-card">
              <div class="product-review__header">
                <strong>{{ ReviewItem.UserName }}</strong>
                <span>{{ ReviewItem.Rating }}/5 · {{ ReviewItem.Status }}</span>
              </div>
              <h3>{{ ReviewItem.Title || 'Không có tiêu đề' }}</h3>
              <p>{{ ReviewItem.Content || 'Không có nội dung.' }}</p>
              <small>{{ formatDateTime(ReviewItem.CreateDate) }}</small>
            </article>
          </div>
          <p v-else>Chưa có đánh giá nào.</p>
        </section>
        <section v-if="RelatedProducts.length">
          <div class="product-information__heading">
            <h2>{{ Text.RelatedTitle }}</h2>
            <router-link :to="{ name: 'productList' }">{{ Text.BackToCatalog }}</router-link>
          </div>
          <div class="related-products">
            <router-link v-for="RelatedItem in RelatedProducts" :key="RelatedItem.ProductId" :to="{ name: 'productDetail', params: { slug: RelatedItem.Slug } }" class="related-product dm-card">
              <img :src="RelatedItem.PrimaryImageUrl || 'https://placehold.co/240x240?text=No+Image'" :alt="RelatedItem.Name" />
              <div class="related-product__body">
                <strong>{{ RelatedItem.Name }}</strong>
                <span>{{ formatPriceRange(RelatedItem.MinSalePrice, RelatedItem.MaxSalePrice) }}</span>
                <small v-if="hasProductDiscount(RelatedItem)">{{ formatPriceRange(RelatedItem.BaseMinSalePrice, RelatedItem.BaseMaxSalePrice) }}</small>
              </div>
            </router-link>
          </div>
        </section>
      </article>

      <aside v-if="ProtectionItems.length" class="product-protection dm-card">
        <h2>{{ Text.ProtectionTitle }}</h2>
        <div
          v-for="ProtectionItem in ProtectionItems"
          :key="ProtectionItem.Label"
          class="product-protection__item"
        >
          <span class="material-symbols-outlined" aria-hidden="true">{{ ProtectionItem.Icon }}</span>
          <div>
            <strong>{{ ProtectionItem.Label }}</strong>
            <p>{{ ProtectionItem.Value }}</p>
          </div>
        </div>
      </aside>
    </div>
  </section>

  <section v-else class="product-not-found dm-card">
    <span class="material-symbols-outlined" aria-hidden="true">inventory_2</span>
    <h1>{{ Text.ProductNotFound }}</h1>
    <p>{{ ErrorMessage || Text.ProductNotFoundDescription }}</p>
    <router-link :to="{ name: 'home' }" class="dm-btn">{{ Text.BackHome }}</router-link>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import DMButton from "@/components/base/DMButton.vue";
import { getProducts, getProductBySlug } from "@/services/catalogService";
import { getProductReviews } from "@/services/expansionService";
import { addProductToCart, getCartQuantityByVariantId } from "@/stores/cartStore";
import { formatI18nText } from "@/utils/i18n";
import { formatCompactNumber, formatCurrency, formatDateTime } from "@/utils/shopFormatters";

const Route = useRoute();
const Router = useRouter();
const Text = inject("i18nCommon").ProductDetail;
const Quantity = ref(1);
const SelectedImageUrl = ref("");
const SelectedVariantId = ref(null);
const Product = ref(null);
const RelatedProducts = ref([]);
const ReviewSummary = ref(null);
const IsLoading = ref(false);
const ErrorMessage = ref("");
const ActionMessage = ref("");

const Category = computed(() => Product.value?.CategoryName || "Sản phẩm");
const BrandName = computed(() => Product.value?.BrandName || "Dorm Mart");
const ProductImages = computed(() => Product.value?.Images || []);
const ProductVariants = computed(() => Product.value?.Variants || []);
const isSellableVariant = (VariantItem) => Number(VariantItem?.Status ?? 1) === 1 && Number(VariantItem?.AvailableStock ?? 0) > 0;
const SelectedVariant = computed(() =>
  ProductVariants.value.find((VariantItem) => VariantItem.ProductVariantId === SelectedVariantId.value)
  || ProductVariants.value[0]
  || null,
);
const FirstSellableVariant = computed(() => ProductVariants.value.find(isSellableVariant) || null);
const formatPriceRange = (MinPrice, MaxPrice) => {
  const Min = Number(MinPrice || 0);
  const Max = Number(MaxPrice || 0);
  return Max > Min ? `${formatCurrency(Min)} - ${formatCurrency(Max)}` : formatCurrency(Min);
};
const hasProductDiscount = (ProductItem) => Number(ProductItem?.BaseMinSalePrice ?? ProductItem?.MinSalePrice ?? 0) > Number(ProductItem?.MinSalePrice ?? 0)
  || Number(ProductItem?.BaseMaxSalePrice ?? ProductItem?.MaxSalePrice ?? 0) > Number(ProductItem?.MaxSalePrice ?? 0);
const BaseMinPrice = computed(() => Number(Product.value?.BaseMinSalePrice ?? Product.value?.MinSalePrice ?? 0));
const BaseMaxPrice = computed(() => Number(Product.value?.BaseMaxSalePrice ?? Product.value?.MaxSalePrice ?? BaseMinPrice.value));
const CurrentMinPrice = computed(() => Number(Product.value?.MinSalePrice ?? 0));
const CurrentMaxPrice = computed(() => Number(Product.value?.MaxSalePrice ?? CurrentMinPrice.value));
const HasDiscount = computed(() => BaseMinPrice.value > CurrentMinPrice.value || BaseMaxPrice.value > CurrentMaxPrice.value);
const OldPriceText = computed(() => formatPriceRange(BaseMinPrice.value, BaseMaxPrice.value));
const CurrentPriceText = computed(() => formatPriceRange(CurrentMinPrice.value, CurrentMaxPrice.value));
const SelectedVariantStock = computed(() => Number(SelectedVariant.value?.AvailableStock ?? 0));
const ReservedVariantQuantity = computed(() => getCartQuantityByVariantId(SelectedVariant.value?.ProductVariantId));
const DisplayedVariantStock = computed(() => Math.max(0, SelectedVariantStock.value - ReservedVariantQuantity.value));
const IsAvailable = computed(() => Number(Product.value?.Status) === 1);
const CanAddToCart = computed(() => IsAvailable.value && isSellableVariant(SelectedVariant.value) && DisplayedVariantStock.value > 0);
const CanIncreaseQuantity = computed(() => CanAddToCart.value && Quantity.value < DisplayedVariantStock.value);
const AvailabilityText = computed(() => {
  if (!IsAvailable.value) {
    return Text.Unavailable || "Ngừng bán";
  }

  if (!SelectedVariant.value && !FirstSellableVariant.value) {
    return Text.OutOfStock;
  }

  if (CanAddToCart.value) {
    return Text.AvailableStock.replace("{count}", String(DisplayedVariantStock.value));
  }

  return Text.OutOfStock;
});
const DiscountPercent = computed(() => {
  const OriginalPrice = BaseMaxPrice.value;
  const SalePrice = CurrentMinPrice.value;

  if (OriginalPrice <= SalePrice || OriginalPrice <= 0) return 0;
  return Math.round(((OriginalPrice - SalePrice) / OriginalPrice) * 100);
});
const ReviewCount = computed(() => Number(ReviewSummary.value?.ReviewCount || 0));
const AverageRating = computed(() => Number(ReviewSummary.value?.AverageRating || 0));
const ReviewLabel = computed(() => `${AverageRating.value.toFixed(1)}/5 · ${ReviewCount.value} ${Text.ReviewLabel}`);
const ProductMetrics = computed(() => [
  Product.value?.ProductCode ? { Label: "Mã SP", Value: Product.value.ProductCode } : null,
  Product.value?.CategoryName ? { Label: "Danh mục", Value: Product.value.CategoryName } : null,
  SelectedVariant.value?.Sku ? { Label: "SKU", Value: SelectedVariant.value.Sku } : null,
].filter(Boolean));
const ProtectionItems = computed(() => [
  Product.value?.ProductCode
    ? {
      Icon: "inventory_2",
      Label: "Mã sản phẩm",
      Value: Product.value.ProductCode,
    }
    : null,
  Product.value?.CategoryName
    ? {
      Icon: "category",
      Label: "Danh mục",
      Value: Product.value.CategoryName,
    }
    : null,
  Product.value?.BrandName
    ? {
      Icon: "verified",
      Label: "Thương hiệu",
      Value: Product.value.BrandName,
    }
    : null,
  SelectedVariant.value?.Sku
    ? {
      Icon: "qr_code_2",
      Label: "SKU biến thể",
      Value: SelectedVariant.value.Sku,
    }
    : null,
].filter(Boolean));

const loadProduct = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";
  ActionMessage.value = "";

  try {
    const ProductData = await getProductBySlug(Route.params.slug);
    Product.value = ProductData;
    SelectedVariantId.value = ProductData?.Variants?.find((VariantItem) => VariantItem.IsDefault && isSellableVariant(VariantItem))?.ProductVariantId
      || ProductData?.Variants?.find(isSellableVariant)?.ProductVariantId
      || ProductData?.Variants?.find((VariantItem) => VariantItem.IsDefault)?.ProductVariantId
      || ProductData?.Variants?.[0]?.ProductVariantId
      || null;
    SelectedImageUrl.value = ProductData?.Images?.find((ImageItem) => ImageItem.IsPrimary)?.ImageUrl
      || ProductData?.Images?.[0]?.ImageUrl
      || "https://placehold.co/600x600?text=No+Image";
    Quantity.value = 1;

    if (ProductData?.CategoryId) {
      const RelatedData = await getProducts({ CategoryId: ProductData.CategoryId, PageSize: 4 });
      RelatedProducts.value = (RelatedData.Items || []).filter((Item) => Item.ProductId !== ProductData.ProductId).slice(0, 3);
    }

    try {
      ReviewSummary.value = await getProductReviews(ProductData.ProductId);
    } catch {
      ReviewSummary.value = null;
    }
  } catch (Error) {
    Product.value = null;
    RelatedProducts.value = [];
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

watch(() => Route.params.slug, loadProduct);
watch(SelectedVariantId, () => {
  if (!CanAddToCart.value) {
    Quantity.value = 1;
    return;
  }

  Quantity.value = Math.min(Math.max(1, Quantity.value), DisplayedVariantStock.value);
});
onMounted(loadProduct);

const changeQuantity = (Delta) => {
  if (!Product.value || !CanAddToCart.value) return;
  Quantity.value = Math.min(DisplayedVariantStock.value, Math.max(1, Quantity.value + Delta));
};

const handleAddToCart = async (Checkout) => {
  if (!Product.value || !CanAddToCart.value) {
    ActionMessage.value = AvailabilityText.value;
    return;
  }

  try {
    await addProductToCart({
      ProductSlug: Product.value.Slug,
      ProductVariantId: SelectedVariantId.value,
      Quantity: Quantity.value,
    });
    ActionMessage.value = "Đã thêm sản phẩm vào giỏ hàng.";
    if (Checkout) {
      Router.push({ name: "cart" });
    }
  } catch (Error) {
    ActionMessage.value = Error.message;
  }
};
</script>
