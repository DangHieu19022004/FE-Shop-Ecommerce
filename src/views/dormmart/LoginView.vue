<template>
  <article class="dm-card dm-auth__card">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; border-radius: 14px; margin: 0 auto 14px; background: var(--dm-surface-soft); display: grid; place-items: center; font-size: 28px;">🛒</div>
      <h1 style="font-size: 32px; margin-bottom: 8px;">Welcome Back</h1>
      <p style="color: var(--dm-text-soft);">Sign in to access student-exclusive deals.</p>
    </div>

    <form style="display: grid; gap: 14px;">
      <div>
        <label for="login-email" style="display: block; margin-bottom: 6px; font-weight: 600;">Email or Phone</label>
        <input id="login-email" class="dm-field" placeholder="student@university.edu" readonly />
      </div>
      <div>
        <label for="login-password" style="display: block; margin-bottom: 6px; font-weight: 600;">Password</label>
        <input id="login-password" class="dm-field" type="password" placeholder="••••••••" readonly />
      </div>
      <div style="display: flex; justify-content: space-between; gap: 12px; color: var(--dm-text-soft); font-size: 14px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
          <input type="checkbox" checked />
          <span>Remember me</span>
        </label>
        <a href="#" style="color: var(--dm-primary);">Forgot password?</a>
      </div>
      <button type="button" class="dm-btn" style="width: 100%;">Sign In</button>
    </form>

    <div style="display: flex; align-items: center; gap: 14px; margin: 20px 0; color: var(--dm-text-soft);">
      <div style="height: 1px; background: var(--dm-border); flex: 1;"></div>
      <span style="font-size: 12px; text-transform: uppercase; font-weight: 700;">or</span>
      <div style="height: 1px; background: var(--dm-border); flex: 1;"></div>
    </div>

    <button type="button" class="dm-btn-ghost" style="width: 100%; margin-bottom: 18px;">Continue with Google</button>

    <p style="text-align: center; color: var(--dm-text-soft);">
      New to Dorm Mart?
      <router-link to="/register" style="color: var(--dm-primary); font-weight: 700;">Register now</router-link>
    </p>
  </article>
</template>
