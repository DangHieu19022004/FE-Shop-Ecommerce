<template>
  <article class="dm-card dm-auth__card">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 32px; margin-bottom: 8px;">Create Account</h1>
      <p style="color: var(--dm-text-soft);">Join Dorm Mart to get started.</p>
    </div>

    <form style="display: grid; gap: 14px;">
      <div>
        <label for="register-name" style="display: block; margin-bottom: 6px; font-weight: 600;">Full Name</label>
        <input id="register-name" class="dm-field" placeholder="John Doe" readonly />
      </div>
      <div>
        <label for="register-email" style="display: block; margin-bottom: 6px; font-weight: 600;">University Email</label>
        <input id="register-email" class="dm-field" placeholder="student@university.edu" readonly />
      </div>
      <div>
        <label for="register-phone" style="display: block; margin-bottom: 6px; font-weight: 600;">Phone Number</label>
        <input id="register-phone" class="dm-field" placeholder="(555) 123-4567" readonly />
      </div>
      <div>
        <label for="register-password" style="display: block; margin-bottom: 6px; font-weight: 600;">Password</label>
        <input id="register-password" class="dm-field" type="password" placeholder="••••••••" readonly />
      </div>
      <label style="display: flex; align-items: flex-start; gap: 10px; color: var(--dm-text-soft); font-size: 14px;">
        <input type="checkbox" checked />
        <span>I agree to Terms & Conditions</span>
      </label>
      <button type="button" class="dm-btn" style="width: 100%;">Register</button>
    </form>

    <div style="display: flex; align-items: center; gap: 14px; margin: 20px 0; color: var(--dm-text-soft);">
      <div style="height: 1px; background: var(--dm-border); flex: 1;"></div>
      <span style="font-size: 12px; text-transform: uppercase; font-weight: 700;">or</span>
      <div style="height: 1px; background: var(--dm-border); flex: 1;"></div>
    </div>

    <button type="button" class="dm-btn-ghost" style="width: 100%; margin-bottom: 18px;">Continue with Google</button>

    <p style="text-align: center; color: var(--dm-text-soft);">
      Already have an account?
      <router-link to="/login" style="color: var(--dm-primary); font-weight: 700;">Sign in</router-link>
    </p>
  </article>
</template>
