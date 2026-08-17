<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const slides = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAviuCh-bS4nu0gIbM7pvO_2oW6aFHuWVBrusFghbzPB63tmzRvRRSZQ4c2tPxOQIXzJzVCVJxtEeihkZM0apZ69p57eUG5A8-P8gqDw5TGqlZE44nQSu1RMw3_WcHrcjpv33swmH4rjyJtQ4DtgtTXJNW8gG0zqKOv0BPbm2zTqnSdrpV9yvOB6r634619zZ9MteaW3f3XdpOB7BFa9MJmdlAX4ZnGkjD-dv7rye6NpuBcTM3AhP8qLA",
    tag: "BACK TO UNI SALE",
    title: "Upgrade Your Space.",
    subtitle: "Up to 50% off mini appliances and smart lighting.",
    button: "Shop Now",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0sumWcQFyqlzlrmGRvWybX2kIqfoyLaQWlZpi_C8O_P2QQiz_muNHGAO1MVloiI5lfFDaaY26XIw2v27XA6hnxY63Fy3gRzdI277uRubjGlVojYZckBnmHsDPESklwwxEvVzXB7QcsW4482IfFYzgLK7yDSp9ZtuEep9oUjYwa4Ea7jP2hxBct5IZjEED4hWW-7GC5vdwhvGCkbva4pMM_T-Tyg1XVVic606gHy86RteX_1p7O2y7Ow",
    tag: "STATIONERY HAUL",
    title: "Study in Style.",
    subtitle: "Pastel desk accessories and premium notebooks.",
    button: "Browse Deals",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfVlRLBjPx_d38Y5M8eQDBgJ8B1McKBrq3lfSdUzPuK1dVRObftbJE-M13E3zNADkJlhkAx4F6cEqCmlEys9VwmyGOTy2fgEb5nspGzv9gx1C-5WOph_ZEEwrVwYFMPBdQBxVJr9tF18EmCAbh4_qJoFi6wuh0u07cNHsOteB9k2y9uXsRUwof-ULc_i9mno-jN6Lq4O8Tw40BIY34Va8eaEvT-aHcVw-eDfaOKocvhGAduwITbjYkTA",
    tag: "AIR PURIFIERS",
    title: "Breathe Easy.",
    subtitle: "Compact units built for small dorm spaces.",
    button: "See Collection",
  },
];

const categories = [
  { icon: "local_laundry_service", label: "Appliances" },
  { icon: "edit", label: "Stationery" },
  { icon: "devices", label: "Tech Gear" },
  { icon: "bed", label: "Bedding" },
  { icon: "fastfood", label: "Snacks" },
  { icon: "chair", label: "Furniture" },
  { icon: "cleaning_services", label: "Cleaning" },
  { icon: "fitness_center", label: "Fitness" },
  { icon: "sell", label: "Vouchers" },
  { icon: "bolt", label: "Flash Sale" },
];

const flashProducts = [
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmu3vE3e_1wj0eEK5BwK7Zti4aWEM987lQDM6mZiLGRj-1X0l5v_0Oxa_YdVf3WVkVf3SqM7nWKs1IRb8FaQEubCiD1dBN9eG5AcnGwcG3_c2Tc6hYfgBE1BG9LcyAQcntBoxEMyD0lCZPbiLPfrjPQZrpCA2XMbNnO5VV39AII3fXsDzaDsQ3GMYp8h8L4CqRfps71nsbKIi1gocmmx_dJOnXm68mn3zbGE2ulvkz7JfC_kf0dUkWqg",
    discount: "25%",
    price: "$45.00",
    sold: "85 SOLD",
    progress: 85,
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-Vl8_ulWkjEVAfiI6_U2DaoChSpv38LZgBZXCknKRRjE9tQG3ndFpKqyiCP5Toay4IgaFmo5xZYzYDPop7PgFMUbSRTwrtk0XW3gwUQdY6uNAx8ud4-4zz2hnutWIHNbVXyi12He_9nUmRTa1tHpDOEhXvBZWMn_zGjREAOWbK8Al96v913a0NTqb6jcN5uIDHf4bH5u_S8aCjCHvc2esAa7eoQb9A0youqJ1SZ41lt7xZn7WH7rUIQ",
    discount: "50%",
    price: "$8.50",
    sold: "40 SOLD",
    progress: 40,
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLNhUDJ6PCNcf5RvLL8hyya1gK6cLZFrOCJjGiWgun_4UQZCWqGqeUjwdcEf-o3zVlmxMaZlwvvdvqbX0sodt4kwuEhds-dKJs1OuAoFAvbhs5Fy04Pxk_vIb72F8SEPDROt-qxjQEnlyQcrIgQWAPNVwrn-HFAKbIuhSNwVjjbJl6vp2U6jrZq0_OBQKnLzAsFfnLFPb6cyVYrIsOoQDfQZuCLW4E1zQupXYpSWC85AA2aa73Wi5jJQ",
    discount: "15%",
    price: "$18.90",
    sold: "SELLING FAST",
    progress: 95,
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDxgL16CoZP-Mi5Qs7uFEQVSuldvy4MCVluBfF0tGQ4DL4vgW80zfxdTDKdYu5X9XHVl7_Uu8cYHqBd_0xUBf0kyTINPU7bLZ3fYd46E94LFM8Q4SG-vciU6xFb7WrTmTE1oWNmaXWyGj084dJyrgS2swhZMHAM6wwgK_X8r1RsgiohaapeG2SNVnnn5hhI03l3rX3ZfqP5xWhmOmEQSckKsEDYdfZfPGiFci7flHsQQqplEENN4Xl5kA",
    discount: "30%",
    price: "$55.00",
    sold: "20 SOLD",
    progress: 20,
  },
];

const discoverProducts = [
  {
    badge: "Mall",
    shipping: "Free Shipping",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBvY99vQzzB_bJ1N6qfaL_cxYhjsICQ0V5jhXy3qfhNVtSofZdDdPgx2VyUwUF91VDJHyRIlnffux9gXSixLzE3QwAICQeIxqGO3gZPCduiAJvLB10ekMoBsqhxlwC9Von7U__4ycZLJmNYkb0tqchg0nfml5-GdhNN_-iu0pmO5wUYM3A9rnbI4h6MkMneRuFdks2WbBg5zqrHHah5XpaUECfhRqry2nWeJGHhsP4oWY6eGLpg9Qa2DA",
    title:
      "ArcticBreeze Compact Portable Air Conditioner - Perfect for Dorms, Quiet Cooling",
    price: "$129.00",
    sold: "1.2k sold",
    rating: true,
  },
  {
    badge: "Mall",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD9tFUY-Eiw1P1tw2PEmpkkzCCdhAX8vCCsVN1LraWiKhaKU5qZMGjvhGWUou8EXrS1f-lC3hj9CtdiSk8IYTHgR7kna6evutlskUPsPEvV8e_iaN5JMuTyjkAlXubQYhJ4XOmCeN-0kNvBtYOYJGwSoe-Pj8hT6D15EIeUhQ6jVkFbKYUtbI19J_Bg9M-W5jSODBrhSLNnYxoNrxBxzF-R8tS5Rs20H87e5ETryI00UabDGKB6WPGOVg",
    title: "LumiDesk LED Smart Lamp with Wireless Charging Base - Eye Protection",
    price: "$34.50",
    sold: "850 sold",
  },
  {
    label: "Ad",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAA7rS56CdtRhDAC3ePtJnh7DV4bVS5JjGbUZHyQOYgOjIg9kRLJ85367wAGDUt3qHEUNJ0r1datfdPTCsbZRNcoR8HG31F7yfUhQvjsWoNHMle5XkiVjf49d2qBb0VDzE5vDMziIJEAb7v_6czcy2NZg2wbYphKUfPluh4CBA0Tl595Z7z4WVzqxKtfZJUtn1P67s1i56pMTK4F2yj0Ue2PMPoinHAtCBeCC_b-duAs8ShdKS6KPW7iQ",
    title: "Premium Thick Paper Spiral Notebooks Set of 5 - A5 Size Grid/Lined",
    price: "$15.99",
    sold: "3.5k sold",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqXTu2tVrA01scai0pOBj5So2U8Z0gSTAZPlWrrCIAWV1GepgUKxKlzlyxnrgAtdhJBeAS2w-h2OR-fI4DpPCW5-rcilv01PuHjaDBJGssRMYQZxlSDf8eGXgphxc9wIw_WRmf1flncALDvLONj8O_W5FK2Z7v64CccGT2ldtkxYP54FZIAxcTLsdJ0-DFw3w8gUQjAIcq8TBxK-0dLSsnWixmxFxXPk0lwi0UH4SEW-9kJcBhmQDZNA",
    title: "3-Tier Rolling Utility Cart Organizer - Heavy Duty Metal Shelves",
    price: "$29.90",
    sold: "420 sold",
  },
  {
    shipping: "Free Shipping",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqYv9R-TcwRUJaUOvST0X-k9-8EmkdkRz8Hr6D6Lej-8a2rA6TBgtaQNDUZKG7Q14jLMJRBug-YtfjKdJlzaHab_rOtCDU4D8MmxhVAzmkxTB2I6D38lD5VDQZLtIrZkCkH-xFPiYkxQU98qVrvsspIAoMUpk6Wa0yZqY-MGgAa_Mh87xYIqYdr5l_UpjJANI9856sTCs6WN6Q2w7WO9IqKuNvFmEh3SpQ0uR8kA3xOakXcJQwzc5ueQ",
    title: "Vacuum Storage Bags Space Saver Set (10 Pack) with Hand Pump",
    price: "$19.50",
    sold: "5.1k sold",
  },
  {
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCv7NeqqQFpmqmZ2FyEd8vyFcAEp4-zh2JNXk8UHqObocISMqqpp5RAuNvOMH9zhEy2MIgzg90cdm9m4Reh6vlTt9A62V_lIhozC0jho2F-cLWKPBuqcDphJZjR7ysvkh0-irlN3kVLBkxfpPoGNaTi_t2sv4pUNMe1jh62VL3z1rtz6ZRhlVuWERVILzbcJupx48JInXJuBJZNuMMa1GdZ6_gnss078REf3rLyChRjbveU-DMehX2Uxw",
    title: "Clear Acrylic Desk Organizer - Multifunctional Pen Holder & Storage",
    price: "$12.00",
    sold: "200 sold",
  },
];

const footerColumns = [
  {
    title: "Customer Service",
    links: ["Help Centre", "Dorm Mart Care", "Payment Methods", "Order Tracking", "Return & Refund"],
  },
  {
    title: "About Dorm Mart",
    links: ["Our Story", "Careers", "Privacy Policy", "Student Seller Centre", "Flash Deals"],
  },
  {
    title: "Follow Us",
    links: ["Facebook", "Instagram", "LinkedIn"],
  },
];

const heroIndex = ref(0);
const timer = ref({ hours: 1, minutes: 45, seconds: 22 });
let autoplayId;
let timerId;

const heroSlideStyle = computed(() => ({
  transform: `translateX(-${heroIndex.value * 100}%)`,
}));

const timerText = computed(() =>
  [timer.value.hours, timer.value.minutes, timer.value.seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(" : "),
);

const nextSlide = () => {
  heroIndex.value = (heroIndex.value + 1) % slides.length;
};

const prevSlide = () => {
  heroIndex.value = (heroIndex.value - 1 + slides.length) % slides.length;
};

const startAutoPlay = () => {
  clearInterval(autoplayId);
  autoplayId = window.setInterval(nextSlide, 4500);
};

const tickTimer = () => {
  const next = { ...timer.value };
  if (next.seconds > 0) {
    next.seconds -= 1;
  } else {
    next.seconds = 59;
    if (next.minutes > 0) {
      next.minutes -= 1;
    } else {
      next.minutes = 59;
      next.hours = Math.max(0, next.hours - 1);
    }
  }
  timer.value = next;
};

onMounted(() => {
  startAutoPlay();
  timerId = window.setInterval(tickTimer, 1000);
});

onBeforeUnmount(() => {
  clearInterval(autoplayId);
  clearInterval(timerId);
});
</script>

<template>
  <div class="shop-page">
    <div class="page-glow page-glow--left"></div>
    <div class="page-glow page-glow--right"></div>

    <header class="topbar">
      <div class="topbar__row topbar__row--sm">
        <div class="topbar__links">
          <a href="#">Seller Centre</a>
          <span class="divider"></span>
          <a href="#">Download App</a>
          <span class="divider"></span>
          <a href="#">Follow us</a>
        </div>
        <nav class="topbar__links topbar__links--right">
          <a href="#">Notifications</a>
          <a href="#">Help</a>
          <a href="#">English</a>
          <a href="#">Sign Up</a>
          <a href="#">Login</a>
        </nav>
      </div>

      <div class="topbar__row topbar__row--main">
        <router-link to="/" class="brand" aria-label="Dorm Mart - Trang chủ">
          <span class="dm-brand-icon dm-brand-icon--horizontal-logo" aria-hidden="true"></span>
        </router-link>

        <div class="searchbar">
          <input placeholder="Search for dorm essentials, snacks, and tech" />
          <button type="button" aria-label="Search">
            <span class="material-symbols-outlined">search</span>
          </button>
        </div>

        <div class="header-actions">
          <button type="button" class="icon-button" aria-label="Cart">
            <span class="material-symbols-outlined">shopping_cart</span>
            <span class="badge">3</span>
          </button>
          <button type="button" class="avatar-button" aria-label="Account">
            <span class="material-symbols-outlined">person</span>
          </button>
        </div>
      </div>
    </header>

    <main class="shop-main">
      <section class="hero-shell">
        <div class="hero-grid">
          <div class="hero-carousel">
            <div class="hero-carousel__track" :style="heroSlideStyle">
              <article v-for="slide in slides" :key="slide.title" class="hero-slide">
                <img class="hero-slide__image" :src="slide.image" :alt="slide.title" />
                <div class="hero-slide__overlay"></div>
                <div class="hero-slide__content">
                  <span class="hero-slide__tag">{{ slide.tag }}</span>
                  <h1>{{ slide.title }}</h1>
                  <p>{{ slide.subtitle }}</p>
                  <button type="button" class="primary-button">
                    {{ slide.button }}
                    <span class="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </article>
            </div>

            <button type="button" class="hero-arrow hero-arrow--left" @click="prevSlide" aria-label="Previous slide">
              <span class="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" class="hero-arrow hero-arrow--right" @click="nextSlide" aria-label="Next slide">
              <span class="material-symbols-outlined">chevron_right</span>
            </button>

            <div class="hero-dots">
              <button
                v-for="(_, index) in slides"
                :key="index"
                type="button"
                class="dot"
                :class="{ 'dot--active': index === heroIndex }"
                @click="heroIndex = index"
                :aria-label="`Go to slide ${index + 1}`"
              />
            </div>
          </div>

          <div class="hero-side">
            <article v-for="banner in slides.slice(1)" :key="banner.title" class="side-banner">
              <img :src="banner.image" :alt="banner.title" class="side-banner__image" />
              <div class="side-banner__overlay"></div>
              <div class="side-banner__content">
                <h3>{{ banner.tag }}</h3>
                <p>{{ banner.subtitle }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section__header">
          <h2>
            <span class="material-symbols-outlined">category</span>
            Shop by Category
          </h2>
          <a href="#">See All Categories</a>
        </div>

        <div class="category-grid">
          <a v-for="category in categories" :key="category.label" href="#" class="category-card">
            <div class="category-card__icon">
              <span class="material-symbols-outlined">{{ category.icon }}</span>
            </div>
            <span>{{ category.label }}</span>
          </a>
        </div>
      </section>

      <section class="section flash-sale">
        <aside class="flash-sale__intro">
          <div class="flash-sale__grain"></div>
          <div class="flash-sale__copy">
            <div class="flash-sale__headline">
              <span class="material-symbols-outlined">bolt</span>
              <h2>FLASH SALE</h2>
            </div>

            <div class="countdown">
              <div class="countdown__box">{{ timer.hours.toString().padStart(2, "0") }}</div>
              <span>:</span>
              <div class="countdown__box">{{ timer.minutes.toString().padStart(2, "0") }}</div>
              <span>:</span>
              <div class="countdown__box">{{ timer.seconds.toString().padStart(2, "0") }}</div>
            </div>

            <a href="#" class="flash-sale__link">
              View All
              <span class="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </aside>

        <div class="flash-sale__products">
          <article v-for="product in flashProducts" :key="product.price" class="flash-card">
            <div class="flash-card__badge">{{ product.discount }}</div>
            <div class="flash-card__image-wrap">
              <img :src="product.image" :alt="product.price" class="flash-card__image" />
            </div>
            <div class="flash-card__price">{{ product.price }}</div>
            <div class="flash-card__progress">
              <div class="flash-card__progress-fill" :style="{ width: `${product.progress}%` }"></div>
              <span>{{ product.sold }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="daily-title">
          <span>DAILY DISCOVER</span>
        </div>

        <div class="discover-grid">
          <article v-for="item in discoverProducts" :key="item.title" class="discover-card">
            <div class="discover-card__badge-group">
              <span v-if="item.badge" class="discover-card__badge discover-card__badge--dark">{{ item.badge }}</span>
              <span v-if="item.label" class="discover-card__badge discover-card__badge--light">{{ item.label }}</span>
              <span v-if="item.shipping" class="discover-card__badge discover-card__badge--shipping">
                <span class="material-symbols-outlined">local_shipping</span>
                {{ item.shipping }}
              </span>
            </div>

            <div class="discover-card__image-wrap">
              <img :src="item.image" :alt="item.title" class="discover-card__image" />
              <div class="discover-card__hover">
                <span>View Details</span>
              </div>
            </div>

            <div class="discover-card__content">
              <h3>{{ item.title }}</h3>
              <div v-if="item.rating" class="discover-card__rating">
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star</span>
                <span class="material-symbols-outlined">star_half</span>
              </div>
              <div class="discover-card__meta">
                <span class="discover-card__price">{{ item.price }}</span>
                <span class="discover-card__sold">{{ item.sold }}</span>
              </div>
            </div>
          </article>
        </div>

        <div class="section__footer">
          <button type="button" class="secondary-button">Load More</button>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <img
            src="https://lh3.googleusercontent.com/aida/AP1WRLt66z9jsS2Ku4bPKG6Meq2mQ00JChY9WVQW2pybOsyeXTyDAmj7Y37YWx-JoTVpjzuqCbW7qk5qNuT9rglsKx80DGDsn0N4_BpvEb39ITMT0ESbA1Gj63Bg2vhEMGBYACxOEZLijOfhINFPr_u_Swfe55uTB5haYtrb2vv8wt7wtqoZqFXNq4rVBosNSyU6fKPGNfTotXZcgEo6BMQ6N97IsFvl3rdYyk-cHuYTItRDJTQFNQ79GakC6WU56THOpvhD_SzBxsGR65k"
            alt="Dorm Mart"
          />
          <p>TapHoaSinhVien - The leading e-commerce platform for university residents.</p>
        </div>

        <div v-for="column in footerColumns" :key="column.title" class="site-footer__column">
          <h4>{{ column.title }}</h4>
          <a v-for="link in column.links" :key="link" href="#">{{ link }}</a>
        </div>

        <div class="site-footer__payments">
          <h4>Payment</h4>
          <div class="payment-icons">
            <span class="payment-chip">Visa</span>
            <span class="payment-chip">MC</span>
            <span class="payment-chip">Pay</span>
          </div>

          <h4>Shipping</h4>
          <div class="payment-icons">
            <span class="payment-chip payment-chip--green">EXPRESS</span>
            <span class="payment-chip payment-chip--blue">DORM-X</span>
          </div>
        </div>

        <div class="site-footer__download">
          <h4>Download App</h4>
          <div class="download-grid">
            <div class="qr-box">QR CODE</div>
            <div class="store-list">
              <div class="store-chip">App Store</div>
              <div class="store-chip">Play Store</div>
            </div>
          </div>
        </div>
      </div>

      <div class="site-footer__bottom">
        <p>© 2024 Dorm Mart. All Rights Reserved.</p>
        <div class="site-footer__legal">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap");

:global(body) {
  margin: 0;
  font-family: "Inter", sans-serif;
  background: #f5f5f5;
  color: #1a1b1f;
}

:global(*) {
  box-sizing: border-box;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button),
:global(input) {
  font: inherit;
}

.shop-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, #faf8fe 0%, #f5f5f5 100%);
  overflow-x: clip;
}

.page-glow {
  position: fixed;
  pointer-events: none;
  z-index: 0;
  border-radius: 999px;
  filter: blur(110px);
  opacity: 0.35;
}

.page-glow--left {
  inset: 8% auto auto -8%;
  width: 34vw;
  height: 34vw;
  background: rgba(177, 197, 255, 0.45);
}

.page-glow--right {
  inset: 34% -10% auto auto;
  width: 28vw;
  height: 28vw;
  background: rgba(253, 192, 3, 0.18);
}

.topbar,
.shop-main,
.site-footer {
  position: relative;
  z-index: 1;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #001742;
  color: #fff;
  box-shadow: 0 10px 28px rgba(0, 16, 58, 0.12);
}

.topbar__row {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar__row--sm {
  min-height: 32px;
  font-size: 12px;
  opacity: 0.9;
}

.topbar__links {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.topbar__links a:hover {
  color: #b1c5ff;
}

.divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.18);
}

.topbar__row--main {
  min-height: 78px;
  padding-bottom: 2px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.searchbar {
  flex: 1;
  max-width: 700px;
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.searchbar input {
  flex: 1;
  border: 0;
  background: transparent;
  padding: 0 16px;
  min-height: 38px;
  outline: none;
  color: #1a1b1f;
}

.searchbar button {
  width: 80px;
  border: 0;
  background: #001742;
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-shrink: 0;
}

.icon-button,
.avatar-button {
  position: relative;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.icon-button .material-symbols-outlined {
  font-size: 30px;
}

.avatar-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.avatar-button .material-symbols-outlined {
  font-size: 22px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fdc003;
  color: #002b6b;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  border: 2px solid #001742;
}

.shop-main {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: 16px 0 40px;
}

.hero-shell,
.section,
.site-footer {
  margin-top: 16px;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px;
  gap: 16px;
}

.hero-carousel {
  position: relative;
  min-height: 360px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(0, 16, 58, 0.08);
  background: #dfe6f5;
}

.hero-carousel__track {
  height: 100%;
  display: flex;
  transition: transform 0.55s ease;
}

.hero-slide {
  position: relative;
  min-width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-slide__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-slide__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 23, 66, 0.8) 0%, rgba(0, 23, 66, 0.2) 55%, rgba(0, 23, 66, 0.05) 100%);
}

.hero-slide__content {
  position: absolute;
  left: 34px;
  bottom: 34px;
  max-width: 420px;
  color: #fff;
}

.hero-slide__tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 4px;
  background: #fdc003;
  color: #6c5000;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.06em;
  margin-bottom: 18px;
}

.hero-slide__content h1 {
  margin: 0 0 8px;
  font-size: clamp(30px, 4vw, 40px);
  line-height: 1.05;
}

.hero-slide__content p {
  margin: 0 0 22px;
  font-size: 16px;
  line-height: 1.6;
  max-width: 360px;
}

.primary-button,
.secondary-button {
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #fff;
  color: #001742;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 64px;
  border: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #001742;
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: blur(8px);
}

.hero-carousel:hover .hero-arrow {
  opacity: 1;
}

.hero-arrow--left {
  left: 12px;
}

.hero-arrow--right {
  right: 12px;
}

.hero-dots {
  position: absolute;
  inset: auto 0 14px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
}

.dot--active {
  background: #fff;
}

.hero-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-banner {
  position: relative;
  flex: 1;
  min-height: 172px;
  border-radius: 8px;
  overflow: hidden;
  background: #ddd;
  box-shadow: 0 8px 18px rgba(0, 16, 58, 0.08);
}

.side-banner__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.side-banner__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.05) 20%, rgba(0, 0, 0, 0.62) 100%);
}

.side-banner__content {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  color: #fff;
}

.side-banner__content h3 {
  margin: 0 0 4px;
  font-size: 18px;
}

.side-banner__content p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.section {
  margin-top: 28px;
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.section__header h2 {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
}

.section__header h2 .material-symbols-outlined {
  font-size: 22px;
  color: #001742;
}

.section__header a {
  color: #001742;
  font-size: 14px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.category-card {
  min-width: 106px;
  padding: 16px 10px 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(0, 23, 66, 0.06);
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 16, 58, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.category-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #dae2ff;
  display: grid;
  place-items: center;
  color: #001742;
}

.category-card:nth-child(2) .category-card__icon,
.category-card:nth-child(6) .category-card__icon {
  background: #ffdbc9;
}

.category-card:nth-child(3) .category-card__icon,
.category-card:nth-child(10) .category-card__icon {
  background: #ffdf9e;
}

.category-card:nth-child(4) .category-card__icon,
.category-card:nth-child(8) .category-card__icon {
  background: #e3e2e7;
}

.category-card:nth-child(5) .category-card__icon {
  background: #ffd6d1;
}

.category-card__icon .material-symbols-outlined {
  font-size: 24px;
}

.category-card span:last-child {
  font-size: 14px;
  line-height: 1.3;
}

.flash-sale {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 0;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 8px 18px rgba(0, 16, 58, 0.06);
}

.flash-sale__intro {
  position: relative;
  min-height: 280px;
  background: linear-gradient(180deg, #f14d2d 0%, #ee4d2d 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  overflow: hidden;
}

.flash-sale__grain {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.95) 1.7px, transparent 1.7px);
  background-size: 18px 18px;
}

.flash-sale__copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.flash-sale__headline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flash-sale__headline .material-symbols-outlined {
  font-size: 28px;
}

.flash-sale__headline h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1;
  letter-spacing: 0.08em;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown span {
  font-weight: 800;
  font-size: 18px;
}

.countdown__box {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.28);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 13px;
}

.flash-sale__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
}

.flash-sale__products {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  overflow-x: auto;
  padding: 14px;
  background: #fff;
}

.flash-card {
  min-width: 200px;
  padding: 0 10px 8px;
  position: relative;
}

.flash-card__badge {
  position: absolute;
  top: 0;
  left: 10px;
  z-index: 2;
  background: #fdc003;
  color: #6c5000;
  font-size: 11px;
  font-weight: 800;
  padding: 5px 8px;
  border-radius: 4px 4px 4px 0;
}

.flash-card__image-wrap {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 4px;
  background: #e9e7ed;
}

.flash-card__image,
.discover-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.flash-card:hover .flash-card__image,
.discover-card:hover .discover-card__image {
  transform: scale(1.05);
}

.flash-card__price {
  margin-top: 10px;
  color: #ee4d2d;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
}

.flash-card__progress {
  position: relative;
  margin-top: 8px;
  height: 16px;
  border-radius: 999px;
  background: rgba(238, 77, 45, 0.22);
  overflow: hidden;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
}

.flash-card__progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #ee4d2d, #ff7a59);
}

.flash-card__progress span {
  position: relative;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

.daily-title {
  margin: 0 0 20px;
  padding: 16px 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.78);
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 16, 58, 0.04);
}

.daily-title span {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #001742;
}

.discover-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.discover-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(0, 23, 66, 0.08);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100%;
}

.discover-card__badge-group {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 4px;
  left: 0;
  top: 0;
}

.discover-card__badge {
  font-size: 10px;
  font-weight: 800;
  padding: 5px 8px;
}

.discover-card__badge--dark {
  color: #fff;
  background: #001742;
}

.discover-card__badge--light {
  color: #6c5000;
  background: #fdc003;
}

.discover-card__badge--shipping {
  color: #fff;
  background: #00bfa5;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.discover-card__badge--shipping .material-symbols-outlined {
  font-size: 12px;
}

.discover-card__image-wrap {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #e9e7ed;
}

.discover-card__hover {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 23, 66, 0.18);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.discover-card:hover .discover-card__hover {
  opacity: 1;
}

.discover-card__hover span {
  color: #fff;
  background: #001742;
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
}

.discover-card__content {
  padding: 10px 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.discover-card__content h3 {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 400;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.discover-card__rating {
  display: flex;
  align-items: center;
  gap: 1px;
  color: #fdc003;
  font-size: 14px;
}

.discover-card__rating .material-symbols-outlined {
  font-size: 14px;
}

.discover-card__meta {
  margin-top: auto;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.discover-card__price {
  color: #ee4d2d;
  font-size: 18px;
  font-weight: 800;
}

.discover-card__sold {
  color: #757781;
  font-size: 12px;
}

.section__footer {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.secondary-button {
  padding: 12px 22px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 23, 66, 0.16);
  color: #1a1b1f;
  box-shadow: 0 1px 4px rgba(0, 16, 58, 0.04);
}

.site-footer {
  margin-top: 34px;
  border-top: 4px solid #fdc003;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  padding: 32px 0 22px;
}

.site-footer__grid,
.site-footer__bottom {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
}

.site-footer__grid {
  display: grid;
  grid-template-columns: 1.2fr repeat(3, 1fr) 1fr;
  gap: 26px;
  align-items: start;
}

.site-footer__brand img {
  width: 76px;
  height: auto;
  margin-bottom: 12px;
}

.site-footer__brand p {
  margin: 0;
  max-width: 260px;
  color: #444650;
  font-size: 13px;
  line-height: 1.5;
}

.site-footer__column,
.site-footer__payments,
.site-footer__download {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.site-footer__column h4,
.site-footer__payments h4,
.site-footer__download h4 {
  margin: 0;
  text-transform: uppercase;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #001742;
}

.site-footer__column a {
  color: #444650;
  font-size: 14px;
  line-height: 1.5;
}

.payment-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-chip {
  min-width: 54px;
  padding: 6px 10px;
  background: #efedf3;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.payment-chip--green {
  color: #00bfa5;
}

.payment-chip--blue {
  color: #001742;
}

.download-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px;
}

.qr-box,
.store-chip {
  background: #efedf3;
  border-radius: 4px;
  display: grid;
  place-items: center;
  color: #444650;
  font-size: 11px;
}

.qr-box {
  min-height: 80px;
  text-align: center;
  padding: 10px;
}

.store-list {
  display: grid;
  gap: 10px;
}

.store-chip {
  min-height: 35px;
  justify-content: flex-start;
  padding: 0 12px;
}

.site-footer__bottom {
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid rgba(0, 23, 66, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  color: #444650;
  font-size: 13px;
}

.site-footer__legal {
  display: flex;
  gap: 18px;
}

@media (max-width: 1180px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-side {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .flash-sale {
    grid-template-columns: 1fr;
  }

  .flash-sale__intro {
    min-height: 220px;
  }

  .discover-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .site-footer__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .topbar__row,
  .shop-main,
  .site-footer__grid,
  .site-footer__bottom {
    width: min(100% - 24px, 1280px);
  }

  .topbar__row--sm {
    display: none;
  }

  .topbar__row--main {
    flex-wrap: wrap;
    justify-content: center;
    padding: 14px 0;
  }

  .brand {
    width: 100%;
    justify-content: center;
  }

  .searchbar {
    order: 3;
    width: 100%;
    max-width: none;
  }

  .header-actions {
    margin-left: auto;
  }

  .hero-carousel {
    min-height: 280px;
  }

  .hero-slide__content {
    left: 18px;
    right: 18px;
    bottom: 18px;
  }

  .hero-side {
    grid-template-columns: 1fr;
  }

  .category-grid {
    grid-template-columns: repeat(5, minmax(106px, 1fr));
  }

  .discover-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .site-footer__grid {
    grid-template-columns: 1fr;
  }

  .site-footer__bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 560px) {
  .shop-main {
    width: min(100% - 16px, 1280px);
    padding-top: 10px;
  }

  .topbar {
    position: relative;
  }

  .topbar__row--main {
    gap: 10px;
  }

  .hero-carousel {
    min-height: 240px;
  }

  .hero-slide__content h1 {
    font-size: 24px;
  }

  .hero-slide__content p {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .section__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .category-grid {
    grid-template-columns: repeat(5, minmax(90px, 1fr));
  }

  .category-card {
    min-width: 90px;
    padding: 12px 8px;
  }

  .flash-sale__products {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 10px;
  }

  .flash-card {
    min-width: 0;
    padding: 0 6px 8px;
  }

  .discover-grid {
    grid-template-columns: 1fr;
  }

  .daily-title span {
    font-size: 18px;
  }
}
</style>
