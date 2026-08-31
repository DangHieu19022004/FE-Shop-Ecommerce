<template>
  <div ref="Root" class="dm-dropdown" @keydown.esc.stop.prevent="closeDropdown">
    <button ref="Trigger" type="button" class="dm-icon-btn" :aria-label="Label" :aria-expanded="IsOpen" @click="toggleDropdown">
      <slot name="trigger"><span class="material-symbols-outlined" aria-hidden="true">{{ Icon }}</span></slot>
      <span v-if="BadgeCount > 0" class="dm-badge-dot">{{ BadgeCount }}</span>
    </button>
    <section v-if="IsOpen" class="dm-dropdown__panel" :aria-label="Label">
      <header class="dm-dropdown__header"><strong>{{ Title || Label }}</strong><slot name="header" /></header>
      <p v-if="Loading" class="dm-dropdown__state" role="status">{{ LoadingText }}</p>
      <div v-else-if="ErrorText" class="dm-dropdown__state" role="alert"><p>{{ ErrorText }}</p><button type="button" class="dm-btn-ghost" @click="Emit('retry')">{{ RetryText }}</button></div>
      <ul v-else-if="Items.length" class="dm-dropdown__list">
        <li v-for="Item in Items" :key="Item[ItemKey]">
          <button type="button" class="dm-dropdown__item" :class="{ 'dm-dropdown__item--unread': Item.IsUnread }" :disabled="Item.Disabled" @click="selectItem(Item)">
            <slot name="item" :item="Item">
              <span class="dm-dropdown__icon material-symbols-outlined" aria-hidden="true">{{ Item.Icon || 'notifications' }}</span>
              <span class="dm-dropdown__copy"><strong>{{ Item.Title }}</strong><span>{{ Item.Description }}</span><small v-if="Item.Meta">{{ Item.Meta }}</small></span>
              <span v-if="Item.IsUnread" class="dm-dropdown__dot" aria-hidden="true"></span>
            </slot>
          </button>
        </li>
      </ul>
      <p v-else class="dm-dropdown__state">{{ EmptyText }}</p>
      <footer v-if="$slots.footer" class="dm-dropdown__footer"><slot name="footer" :close="closeDropdown" /></footer>
    </section>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const Props = defineProps({
  Items: { type: Array, default: () => [] },
  ItemKey: { type: String, default: 'Id' },
  Label: { type: String, required: true },
  Title: { type: String, default: '' },
  Icon: { type: String, default: 'expand_more' },
  BadgeCount: { type: Number, default: 0 },
  Loading: Boolean,
  LoadingText: { type: String, default: '' },
  ErrorText: { type: String, default: '' },
  RetryText: { type: String, default: '' },
  EmptyText: { type: String, default: '' },
  CloseOnSelect: { type: Boolean, default: true },
});
const Emit = defineEmits(['select', 'open', 'close', 'retry']);
const Root = ref(null);
const Trigger = ref(null);
const IsOpen = ref(false);
const closeDropdown = () => {
  if (!IsOpen.value) return;
  IsOpen.value = false;
  Emit('close');
  Trigger.value?.focus();
};
const toggleDropdown = () => {
  if (IsOpen.value) closeDropdown();
  else { IsOpen.value = true; Emit('open'); }
};
const selectItem = (Item) => {
  Emit('select', Item);
  if (Props.CloseOnSelect) closeDropdown();
};
const handleOutside = (Event) => {
  if (!Root.value?.contains(Event.target) && IsOpen.value) {
    IsOpen.value = false;
    Emit('close');
  }
};
onMounted(() => {
  document.addEventListener('pointerdown', handleOutside);
  document.addEventListener('focusin', handleOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutside);
  document.removeEventListener('focusin', handleOutside);
});
</script>

<style scoped lang="scss">
.dm-dropdown { position: relative; }
.dm-dropdown__panel { position: absolute; top: calc(100% + 12px); right: 0; z-index: 60; width: 380px; max-width: calc(100vw - 32px); overflow: hidden; border: 1px solid var(--dm-border); border-radius: 18px; background: var(--dm-surface); color: var(--dm-text); box-shadow: var(--dm-shadow); text-align: left; }
.dm-dropdown__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px; border-bottom: 1px solid var(--dm-border); }
.dm-dropdown__header strong { font-size: 17px; color: var(--dm-primary); }
.dm-dropdown__list { max-height: min(420px, 55dvh); overflow-y: auto; overscroll-behavior: contain; padding: 0; margin: 0; list-style: none; }
.dm-dropdown__item { display: flex; align-items: flex-start; gap: 12px; width: 100%; border: 0; border-bottom: 1px solid var(--dm-border); padding: 16px; background: var(--dm-surface); color: inherit; text-align: left; font: inherit; cursor: pointer; }
.dm-dropdown__item--unread { background: var(--dm-overlay-soft); }
.dm-dropdown__item:hover { background: var(--dm-surface-soft); }
.dm-dropdown__item:focus-visible { outline: 2px solid var(--dm-primary); outline-offset: -2px; }
.dm-dropdown__item:disabled { opacity: .6; cursor: default; }
.dm-dropdown__icon { display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; background: var(--dm-primary-soft); color: var(--dm-primary); }
.dm-dropdown__copy { display: grid; gap: 5px; min-width: 0; overflow-wrap: anywhere; line-height: 1.5; font-size: 13px; }
.dm-dropdown__copy > span, .dm-dropdown__copy small { color: var(--dm-text-soft); }
.dm-dropdown__dot { width: 7px; height: 7px; flex-shrink: 0; margin-top: 7px; border-radius: 50%; background: var(--dm-primary); }
.dm-dropdown__state { margin: 0; padding: 28px 18px; text-align: center; color: var(--dm-text-soft); }
.dm-dropdown__footer { padding: 12px 18px; border-top: 1px solid var(--dm-border); text-align: center; color: var(--dm-primary); font-size: 13px; font-weight: 700; }
@media (max-width: 720px) { .dm-dropdown__panel { position: fixed; top: 76px; right: 16px; left: 16px; width: auto; } }
</style>
