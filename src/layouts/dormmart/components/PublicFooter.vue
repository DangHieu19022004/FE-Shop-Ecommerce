<template>
  <footer class="dm-footer">
    <div class="dm-footer__inner">
      <div class="dm-footer__grid">
        <div class="dm-footer__column"><h4>{{ Text.BrandName }}</h4><p>{{ Text.BrandDescription }}</p></div>
        <div class="dm-footer__column"><h4>{{ Text.CustomerServiceTitle }}</h4><a href="#">{{ Text.HelpCenter }}</a><a href="#">{{ Text.Blog }}</a><a href="#">{{ Text.ReturnRefund }}</a></div>
        <div class="dm-footer__column"><h4>{{ Text.AboutTitle }}</h4><a href="#">{{ Text.OurStory }}</a><a href="#">{{ Text.StudentSeller }}</a><a href="#">{{ Text.Careers }}</a></div>
        <div class="dm-footer__column"><h4>{{ Text.PaymentTitle }}</h4><span>{{ Text.Visa }}</span><span>{{ Text.Mastercard }}</span><span>{{ Text.CashOnDelivery }}</span></div>
      </div>
      <div class="dm-footer__bottom"><span>{{ Text.Copyright }}</span><span>{{ Text.Regions }}</span></div>
    </div>
  </footer>
</template>

<script setup>
import { inject } from "vue";

const Text = inject("i18nCommon").Common;
</script>
