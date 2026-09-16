<template>
  <section
    class="dm-card dm-home-hero"
    role="region"
    aria-roledescription="carousel"
    :aria-label="Text.HeroCarouselLabel"
    tabindex="0"
    @mouseenter="pauseHeroSlider"
    @mouseleave="resumeHeroSlider"
    @focusin="pauseHeroSlider"
    @focusout="resumeHeroSlider"
    @keydown.left.prevent="previousHeroSlide"
    @keydown.right.prevent="nextHeroSlide"
  >
    <article
      v-for="(Slide, SlideIndex) in HeroSlides"
      :key="Slide.Id"
      class="dm-home-hero__slide"
      :class="{ 'dm-home-hero__slide--active': SlideIndex === ActiveHeroSlideIndex }"
      :aria-hidden="SlideIndex !== ActiveHeroSlideIndex"
    >
      <img class="dm-home-hero__image" :src="Slide.ImageUrl" :alt="Slide.ImageAlt" />
      <div class="dm-home-hero__overlay"></div>
      <div class="dm-home-hero__content">
        <DMBadge warning class="dm-home-hero__badge">{{ Slide.Badge }}</DMBadge>
        <h1>{{ Slide.Title }}</h1>
        <p>{{ Slide.Description }}</p>
        <div class="dm-home-hero__actions">
          <router-link :to="Slide.PrimaryLink" class="dm-btn-ghost dm-home-hero__primary-action">{{ Slide.PrimaryAction }}</router-link>
          <router-link :to="Slide.SecondaryLink" class="dm-btn-ghost dm-home-hero__secondary-action">{{ Slide.SecondaryAction }}</router-link>
        </div>
      </div>
    </article>

    <div class="dm-home-hero__controls" aria-label="Điều khiển slide">
      <button type="button" class="dm-home-hero__arrow" :aria-label="Text.PreviousSlide" @click="previousHeroSlide">
        <span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      </button>
      <div class="dm-home-hero__dots">
        <button
          v-for="(Slide, SlideIndex) in HeroSlides"
          :key="`${Slide.Id}-dot`"
          type="button"
          class="dm-home-hero__dot"
          :class="{ 'dm-home-hero__dot--active': SlideIndex === ActiveHeroSlideIndex }"
          :aria-label="`${Text.GoToSlide} ${SlideIndex + 1}: ${Slide.Title}`"
          :aria-current="SlideIndex === ActiveHeroSlideIndex ? 'true' : undefined"
          @click="selectHeroSlide(SlideIndex)"
        ></button>
      </div>
      <button type="button" class="dm-home-hero__arrow" :aria-label="Text.NextSlide" @click="nextHeroSlide">
        <span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      </button>
    </div>
  </section>

  <div v-if="ErrorMessage" class="dm-card" style="padding: 16px; margin-bottom: 24px; color: var(--dm-danger);">
    {{ ErrorMessage }}
  </div>

  <section class="dm-home-shopping-categories">
    <div class="dm-home-shopping-categories__header">
      <div>
        <h2>{{ Text.CategoryTitle }}</h2>
        <p>{{ Text.CategorySubtitle }}</p>
      </div>
      <router-link to="/products">{{ Text.SeeAll }}</router-link>
    </div>

    <div class="dm-home-shopping-categories__grid">
      <router-link
        :to="{ name: 'promotionList', query: { type: 'flash-sale' } }"
        class="dm-card dm-home-category-card dm-home-category-card--sale"
        :aria-label="`${Text.DiscountCategory}: ${Text.DiscountCategoryDescription}`"
      >
        <span class="dm-home-category-card__flag">{{ Text.DiscountCategoryBadge }}</span>
        <span class="dm-home-category-card__icon" aria-hidden="true">
          <span class="material-symbols-outlined">bolt</span>
        </span>
        <strong>{{ Text.DiscountCategory }}</strong>
        <small>{{ Text.DiscountCategoryDescription }}</small>
        <span class="dm-home-category-card__arrow material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </router-link>

      <router-link
        v-for="CategoryItem in Categories"
        :key="CategoryItem.Id"
        :to="{ name: 'productList', query: { CategoryId: CategoryItem.Id } }"
        class="dm-card dm-home-category-card"
      >
        <span class="dm-home-category-card__icon" aria-hidden="true">
          <span class="material-symbols-outlined">category</span>
        </span>
        <strong>{{ CategoryItem.Name }}</strong>
        <small>{{ Text.CategoryCardDescription }}</small>
        <span class="dm-home-category-card__arrow material-symbols-outlined" aria-hidden="true">arrow_forward</span>
      </router-link>

      <div v-if="!Categories.length && !IsLoading" class="dm-card dm-home-category-card dm-home-category-card--empty">
        <span class="dm-home-category-card__icon" aria-hidden="true">
          <span class="material-symbols-outlined">category</span>
        </span>
        <strong>{{ Text.DataFakeCategories }}</strong>
      </div>
    </div>
  </section>

  <section class="dm-home-flash dm-card" v-if="FlashProducts.length">
    <div class="dm-home-flash__header">
      <div>
        <div class="dm-home-flash__title">
          <span class="material-symbols-outlined">bolt</span>
          <h2>{{ Text.FlashSale }}</h2>
        </div>
      </div>
      <div class="dm-home-flash__badges">
        <DMBadge error icon-name="timer">{{ FlashSaleCountdownText }}</DMBadge>
        <DMBadge neutral>{{ FlashSaleCount }} sản phẩm</DMBadge>
      </div>
    </div>

    <div v-if="IsLoading" class="dm-card" style="padding: 16px; text-align: center;">Đang tải sản phẩm...</div>
    <div v-else-if="FlashProducts.length" class="dm-grid dm-grid--products">
      <ProductCard v-for="ProductItem in FlashProducts" :key="ProductItem.ProductId" :Product="ProductItem" />
    </div>
    <div v-else class="dm-card" style="padding: 16px; text-align: center; color: var(--dm-text-soft);">Chưa có flash sale đang hoạt động.</div>

    <div class="dm-home-flash__note" v-if="Text.FlashSaleNote">
      <span class="material-symbols-outlined">info</span>
      <span >{{ Text.FlashSaleNote }}</span>
    </div>
  </section>

  <section class="dm-home-discover">
    <div class="dm-home-discover__header">
      <div>
        <h2>{{ Text.DailyDiscover }}</h2>
        <p>Sản phẩm thiết yếu được chia theo từng nhu cầu để bạn dễ lựa chọn.</p>
      </div>
      <router-link to="/products" class="dm-home-discover__all-link">{{ Text.BrowseCatalog }}</router-link>
    </div>

    <div v-if="IsLoading" class="dm-card dm-home-discover__state">Đang tải sản phẩm...</div>
    <div v-else-if="ProductSections.length" class="dm-home-category-list">
      <section v-for="SectionItem in ProductSections" :key="SectionItem.Id || SectionItem.Name" class="dm-home-category-section">
        <div class="dm-home-category-section__header">
          <div class="dm-home-category-section__title">
            <span class="material-symbols-outlined" aria-hidden="true">category</span>
            <div>
              <h3>{{ SectionItem.Name }}</h3>
              <span>{{ SectionItem.Products.length }} sản phẩm</span>
            </div>
          </div>
          <router-link :to="SectionItem.Link" class="dm-home-category-section__link">
            Xem danh mục
            <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          </router-link>
        </div>

        <div class="dm-grid dm-grid--products dm-home-category-section__grid">
          <ProductCard v-for="ProductItem in SectionItem.Products" :key="ProductItem.ProductId" :Product="ProductItem" />
        </div>
      </section>
    </div>
    <div v-else class="dm-card dm-home-discover__state">{{ Text.DataFakeProducts }}</div>
  </section>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import ProductCard from "@/components/dormmart/ProductCard.vue";
import { getCategories, getProducts } from "@/services/catalogService";
import { getActiveFlashSales } from "@/services/checkoutService";

const Text = inject("i18nCommon").Home;
const HeroSlides = [
  {
    Id: "student-space",
    Badge: Text.PromotionBadge,
    Title: Text.HeroTitle,
    Description: Text.HeroDescription,
    ImageAlt: Text.HeroAlt,
    ImageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
    PrimaryAction: Text.ShopCatalog,
    PrimaryLink: { name: "productList" },
    SecondaryAction: Text.ExploreCombos,
    SecondaryLink: { name: "comboList" },
  },
  {
    Id: "combo-deal",
    Badge: Text.ComboSlideBadge,
    Title: Text.ComboSlideTitle,
    Description: Text.ComboSlideDescription,
    ImageAlt: Text.ComboSlideAlt,
    ImageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
    PrimaryAction: Text.ComboSlideAction,
    PrimaryLink: { name: "comboList" },
    SecondaryAction: Text.ShopCatalog,
    SecondaryLink: { name: "productList" },
  },
  {
    Id: "flash-sale",
    Badge: Text.FlashSlideBadge,
    Title: Text.FlashSlideTitle,
    Description: Text.FlashSlideDescription,
    ImageAlt: Text.FlashSlideAlt,
    ImageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1600&q=80",
    PrimaryAction: Text.FlashSlideAction,
    PrimaryLink: { name: "promotionList", query: { type: "flash-sale" } },
    SecondaryAction: Text.ExploreCombos,
    SecondaryLink: { name: "comboList" },
  },
];
const Categories = ref([]);
const FlashSales = ref([]);
const FlashProducts = ref([]);
const DiscoverProducts = ref([]);
const IsLoading = ref(false);
const ErrorMessage = ref("");
const Now = ref(Date.now());
const ActiveHeroSlideIndex = ref(0);
const IsHeroSliderPaused = ref(false);
let CountdownTimer = null;
let HeroSlideTimer = null;

const stopHeroSlider = () => {
  if (!HeroSlideTimer) return;
  window.clearInterval(HeroSlideTimer);
  HeroSlideTimer = null;
};

const startHeroSlider = () => {
  stopHeroSlider();
  if (IsHeroSliderPaused.value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  HeroSlideTimer = window.setInterval(() => {
    ActiveHeroSlideIndex.value = (ActiveHeroSlideIndex.value + 1) % HeroSlides.length;
  }, 2000);
};

const selectHeroSlide = (SlideIndex) => {
  ActiveHeroSlideIndex.value = SlideIndex;
  startHeroSlider();
};

const nextHeroSlide = () => {
  selectHeroSlide((ActiveHeroSlideIndex.value + 1) % HeroSlides.length);
};

const previousHeroSlide = () => {
  selectHeroSlide((ActiveHeroSlideIndex.value - 1 + HeroSlides.length) % HeroSlides.length);
};

const pauseHeroSlider = () => {
  IsHeroSliderPaused.value = true;
  stopHeroSlider();
};

const resumeHeroSlider = () => {
  IsHeroSliderPaused.value = false;
  startHeroSlider();
};

const FlashSaleCount = computed(() => FlashProducts.value.length);
const ActiveFlashSale = computed(() => FlashSales.value[0] || null);
const ActiveFlashSaleEndsAt = computed(() => ActiveFlashSale.value?.EndsAt ? new Date(ActiveFlashSale.value.EndsAt).getTime() : 0);
const CountdownParts = computed(() => {
  const Remaining = Math.max(0, ActiveFlashSaleEndsAt.value - Now.value);
  const TotalSeconds = Math.floor(Remaining / 1000);
  const Hours = Math.floor(TotalSeconds / 3600);
  const Minutes = Math.floor((TotalSeconds % 3600) / 60);
  const Seconds = TotalSeconds % 60;
  return { Hours, Minutes, Seconds, Remaining };
});
const FlashSaleCountdownText = computed(() => {
  if (!ActiveFlashSale.value) return Text.FlashSaleCountdown;
  if (CountdownParts.value.Remaining <= 0) return "Flash sale đã kết thúc";
  const { Hours, Minutes, Seconds } = CountdownParts.value;
  if (Hours > 0) return `Còn ${Hours}h ${String(Minutes).padStart(2, "0")}m ${String(Seconds).padStart(2, "0")}s`;
  if (Minutes > 0) return `Còn ${Minutes}m ${String(Seconds).padStart(2, "0")}s`;
  return `Còn ${Seconds}s`;
});
const ProductSections = computed(() => {
  const SectionsByKey = new Map();
  const CategoriesByName = new Map(Categories.value.map((CategoryItem) => [CategoryItem.Name.trim().toLocaleLowerCase("vi"), CategoryItem]));

  DiscoverProducts.value.forEach((ProductItem) => {
    const CategoryById = Categories.value.find((CategoryItem) => CategoryItem.Id === ProductItem.CategoryId);
    const CategoryByName = CategoriesByName.get((ProductItem.CategoryName || "").trim().toLocaleLowerCase("vi"));
    const CategoryItem = CategoryById || CategoryByName;
    const CategoryId = CategoryItem?.Id || ProductItem.CategoryId || "";
    const CategoryName = CategoryItem?.Name || ProductItem.CategoryName || "Sản phẩm khác";
    const CategoryKey = CategoryId || CategoryName;

    if (!SectionsByKey.has(CategoryKey)) {
      SectionsByKey.set(CategoryKey, {
        Id: CategoryKey,
        Name: CategoryName,
        Products: [],
        Link: CategoryId ? { path: "/products", query: { CategoryId } } : "/products",
      });
    }

    SectionsByKey.get(CategoryKey).Products.push(ProductItem);
  });

  const OrderedCategoryKeys = Categories.value.map((CategoryItem) => CategoryItem.Id);
  return [
    ...OrderedCategoryKeys.map((CategoryKey) => SectionsByKey.get(CategoryKey)).filter(Boolean),
    ...Array.from(SectionsByKey.entries())
      .filter(([CategoryKey]) => !OrderedCategoryKeys.includes(CategoryKey))
      .map(([, SectionItem]) => SectionItem),
  ];
});

const loadHomeData = async () => {
  IsLoading.value = true;
  ErrorMessage.value = "";

  try {
    const [CategoryData, ProductData, FlashSaleData] = await Promise.all([
      getCategories(),
      getProducts({ PageSize: 48, Sort: "newest" }),
      getActiveFlashSales().catch(() => []),
    ]);

    Categories.value = CategoryData;
    FlashSales.value = Array.isArray(FlashSaleData) ? FlashSaleData : [];
    FlashProducts.value = FlashSales.value.flatMap((FlashSale) => (FlashSale.Items || []).map((Item) => {
      const RemainingStock = Math.max(0, Number(Item.FlashStock || 0) - Number(Item.SoldCount || 0));
      return {
        ProductId: Item.ProductVariantId,
        ProductVariantId: Item.ProductVariantId,
        Slug: Item.ProductSlug || Item.Slug || Item.Sku,
        Name: Item.VariantName || Item.ProductName || Item.Sku,
        PrimaryImageUrl: Item.PrimaryImageUrl,
        BrandName: Item.BrandName || Item.ProductBrandName || "Flash Sale",
        CampaignName: FlashSale.Name || "Khuyến mãi",
        BadgeText: Item.SoldCount || Item.FlashStock ? `Còn ${RemainingStock} sp` : "",
        ShortDescription: Item.ShortDescription || `Ưu đãi thuộc ${FlashSale.Name || "chương trình flash sale"}`,
        ProductCode: Item.Sku,
        Status: 1,
        AvailableStock: RemainingStock,
        HasSellableVariant: RemainingStock > 0,
        MinSalePrice: Item.FlashPrice,
        MaxSalePrice: Item.FlashPrice,
        BaseMinSalePrice: Item.OriginalPrice,
        BaseMaxSalePrice: Item.OriginalPrice,
      };
    })).slice(0, 4);
    DiscoverProducts.value = ProductData.Items || [];
  } catch (Error) {
    ErrorMessage.value = Error.message;
  } finally {
    IsLoading.value = false;
  }
};

onMounted(() => {
  loadHomeData();
  startHeroSlider();
  CountdownTimer = window.setInterval(() => {
    Now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  if (CountdownTimer) window.clearInterval(CountdownTimer);
  stopHeroSlider();
});
</script>

<style scoped lang="scss">
.dm-home-hero {
  position: relative;
  min-height: 360px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #0b244d;
  color: #fff;
  isolation: isolate;
}

.dm-home-hero:focus-visible {
  outline: 3px solid var(--dm-warning);
  outline-offset: 3px;
}

.dm-home-hero__slide {
  position: absolute;
  inset: 0;
  z-index: 0;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.55s ease, visibility 0.55s ease;
}

.dm-home-hero__slide--active {
  z-index: 1;
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

.dm-home-hero__image,
.dm-home-hero__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.dm-home-hero__image {
  object-fit: cover;
  transform: scale(1.035);
  transition: transform 5s ease-out;
}

.dm-home-hero__slide--active .dm-home-hero__image {
  transform: scale(1);
}

.dm-home-hero__overlay {
  background: linear-gradient(90deg, rgba(0, 23, 66, 0.9) 0%, rgba(0, 23, 66, 0.66) 44%, rgba(0, 23, 66, 0.12) 100%);
}

.dm-home-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 360px;
  max-width: 570px;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 36px 36px 72px;
}

.dm-home-hero__badge {
  margin-bottom: 18px;
}

.dm-home-hero__content h1,
.dm-home-hero__content p {
  margin-top: 0;
}

.dm-home-hero__content h1 {
  max-width: 540px;
  min-height: 2.1em;
  margin-bottom: 12px;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.05;
}

.dm-home-hero__content p {
  max-width: 520px;
  min-height: 3.2em;
  margin-bottom: 22px;
  font-size: 16px;
  line-height: 1.6;
}

.dm-home-hero__actions,
.dm-home-hero__controls,
.dm-home-hero__dots {
  display: flex;
  align-items: center;
}

.dm-home-hero__actions {
  gap: 12px;
  flex-wrap: wrap;
}

.dm-home-hero__primary-action {
  background: #fff;
}

.dm-home-hero__secondary-action {
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  backdrop-filter: blur(8px);
}

.dm-home-hero__controls {
  position: absolute;
  right: 24px;
  bottom: 22px;
  z-index: 4;
  gap: 10px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: rgba(0, 23, 66, 0.46);
  backdrop-filter: blur(10px);
}

.dm-home-hero__arrow,
.dm-home-hero__dot {
  border: 0;
  cursor: pointer;
}

.dm-home-hero__arrow {
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.dm-home-hero__arrow:hover,
.dm-home-hero__arrow:focus-visible {
  background: #fff;
  color: var(--dm-primary);
}

.dm-home-hero__arrow .material-symbols-outlined {
  font-size: 22px;
}

.dm-home-hero__dots {
  gap: 7px;
}

.dm-home-hero__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  transition: width 0.2s ease, background 0.2s ease;
}

.dm-home-hero__dot--active {
  width: 26px;
  background: var(--dm-warning);
}

.dm-home-hero__arrow:focus-visible,
.dm-home-hero__dot:focus-visible,
.dm-home-hero__actions a:focus-visible {
  outline: 3px solid var(--dm-warning);
  outline-offset: 2px;
}

.dm-home-shopping-categories {
  margin-bottom: 28px;
}

.dm-home-shopping-categories__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.dm-home-shopping-categories__header h2,
.dm-home-shopping-categories__header p {
  margin: 0;
}

.dm-home-shopping-categories__header h2 {
  color: var(--dm-text);
  font-size: 24px;
}

.dm-home-shopping-categories__header p {
  margin-top: 5px;
  color: var(--dm-text-soft);
  font-size: 14px;
}

.dm-home-shopping-categories__header > a {
  flex-shrink: 0;
  color: var(--dm-primary);
  font-weight: 750;
}

.dm-home-shopping-categories__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(168px, 1fr));
  gap: 14px;
}

.dm-home-category-card {
  position: relative;
  display: grid;
  min-width: 0;
  min-height: 178px;
  overflow: hidden;
  align-content: start;
  gap: 7px;
  padding: 18px;
  border: 1px solid var(--dm-border);
  color: var(--dm-text);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.dm-home-category-card:hover {
  border-color: var(--dm-primary);
  box-shadow: var(--dm-shadow);
  transform: translateY(-3px);
}

.dm-home-category-card__icon {
  display: grid;
  width: 52px;
  height: 52px;
  margin-bottom: 4px;
  place-items: center;
  border-radius: 16px;
  background: var(--dm-primary-soft);
  color: var(--dm-primary);
}

.dm-home-category-card__icon .material-symbols-outlined {
  font-size: 27px;
}

.dm-home-category-card strong {
  overflow-wrap: anywhere;
  font-size: 16px;
  line-height: 1.35;
}

.dm-home-category-card small {
  color: var(--dm-text-soft);
  font-size: 12px;
  line-height: 1.45;
}

.dm-home-category-card__arrow {
  position: absolute;
  right: 16px;
  bottom: 16px;
  color: var(--dm-primary);
  font-size: 20px;
  transition: transform 180ms ease;
}

.dm-home-category-card:hover .dm-home-category-card__arrow {
  transform: translateX(3px);
}

.dm-home-category-card--sale {
  border-color: transparent;
  background: linear-gradient(145deg, #991b1b 0%, #ef4444 58%, #f59e0b 100%);
  color: #fff;
  box-shadow: 0 14px 32px rgba(220, 38, 38, 0.2);
}

.dm-home-category-card--sale::after {
  position: absolute;
  width: 120px;
  height: 120px;
  border: 28px solid rgba(255, 255, 255, 0.09);
  border-radius: 50%;
  content: "";
  right: -58px;
  top: -58px;
}

.dm-home-category-card--sale:hover {
  border-color: transparent;
  box-shadow: 0 18px 38px rgba(220, 38, 38, 0.28);
}

.dm-home-category-card--sale .dm-home-category-card__icon {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.dm-home-category-card--sale small,
.dm-home-category-card--sale .dm-home-category-card__arrow {
  color: rgba(255, 255, 255, 0.88);
}

.dm-home-category-card__flag {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff;
  color: #dc2626;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.dm-home-category-card--empty {
  color: var(--dm-text-soft);
  pointer-events: none;
}

.dm-home-flash {
  display: grid;
  gap: 18px;
  padding: 22px;
  margin-bottom: 24px;
  background: linear-gradient(180deg, rgba(186, 26, 26, 0.05), transparent 36%), var(--dm-surface);
}

.dm-home-flash__header,
.dm-home-flash__badges,
.dm-home-flash__title,
.dm-home-flash__note {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dm-home-flash__header {
  justify-content: space-between;
  flex-wrap: wrap;
}

.dm-home-flash__title h2,
.dm-home-flash__header p {
  margin: 0;
}

.dm-home-flash__title {
  color: var(--dm-danger);
  margin-bottom: 6px;
}

.dm-home-flash__note {
  padding-top: 6px;
  border-top: 1px solid var(--dm-border);
  font-size: 13px;
}

.dm-home-flash__note .material-symbols-outlined {
  color: var(--dm-primary);
  font-size: 18px;
}

.dm-home-discover {
  display: grid;
  gap: 20px;
}

.dm-home-discover__header,
.dm-home-category-section__header,
.dm-home-category-section__title,
.dm-home-category-section__link {
  display: flex;
  align-items: center;
}

.dm-home-discover__header,
.dm-home-category-section__header {
  justify-content: space-between;
  gap: 16px;
}

.dm-home-discover__header h2,
.dm-home-discover__header p,
.dm-home-category-section__title h3 {
  margin: 0;
}

.dm-home-discover__header h2 {
  font-size: 24px;
}

.dm-home-discover__header p {
  margin-top: 5px;
  color: var(--dm-text-soft);
  font-size: 14px;
}

.dm-home-discover__all-link,
.dm-home-category-section__link {
  flex-shrink: 0;
  color: var(--dm-primary);
  font-weight: 700;
}

.dm-home-category-list {
  display: grid;
  gap: 30px;
}

.dm-home-category-section {
  display: grid;
  gap: 16px;
}

.dm-home-category-section__header {
  padding-bottom: 12px;
  border-bottom: 2px solid var(--dm-primary-soft);
}

.dm-home-category-section__title {
  gap: 10px;
}

.dm-home-category-section__title > .material-symbols-outlined {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  background: var(--dm-primary-soft);
  color: var(--dm-primary);
}

.dm-home-category-section__title h3 {
  color: var(--dm-primary);
  font-size: 20px;
}

.dm-home-category-section__title div > span {
  color: var(--dm-text-soft);
  font-size: 12px;
}

.dm-home-category-section__link {
  gap: 4px;
  font-size: 14px;
}

.dm-home-category-section__link .material-symbols-outlined {
  font-size: 18px;
}

.dm-home-category-section__grid {
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
}

.dm-home-discover__state {
  padding: 18px;
  color: var(--dm-text-soft);
}

@media (max-width: 720px) {
  .dm-home-hero {
    min-height: 480px;
  }

  .dm-home-hero__content {
    min-height: 480px;
    padding: 28px 20px 92px;
  }

  .dm-home-hero__content p {
    min-height: 4.8em;
    font-size: 15px;
  }

  .dm-home-hero__actions {
    width: min(100%, 240px);
    flex-direction: column;
    align-items: stretch;
  }

  .dm-home-hero__controls {
    right: auto;
    left: 20px;
    bottom: 20px;
  }

  .dm-home-flash {
    padding: 16px;
  }

  .dm-home-shopping-categories__header {
    align-items: flex-start;
  }

  .dm-home-shopping-categories__header p {
    max-width: 240px;
  }

  .dm-home-shopping-categories__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .dm-home-category-card {
    min-height: 164px;
    padding: 14px;
  }

  .dm-home-category-card__arrow {
    right: 13px;
    bottom: 13px;
  }

  .dm-home-discover__header,
  .dm-home-category-section__header {
    align-items: flex-start;
  }

  .dm-home-category-section__grid {
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .dm-home-hero__slide,
  .dm-home-hero__image,
  .dm-home-hero__dot {
    transition: none;
  }
}
</style>
