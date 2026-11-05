<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="auth-layout">
    <aside class="auth-layout__brand">
      <div class="auth-layout__brand-inner">
        <div class="auth-layout__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>
        <h1 class="auth-layout__title">出勤管理系統</h1>
        <p class="auth-layout__subtitle">
          整合打卡、出勤紀錄與請假流程，讓學員、企業與管理員在同一個平台協作。
        </p>
      </div>
    </aside>

    <main class="auth-layout__content">
      <div class="auth-layout__card">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  min-height: 100vh;
}

.auth-layout__brand {
  display: flex;
  align-items: center;
  padding: 48px;
  background: linear-gradient(160deg, #1e3a8a 0%, #2f6fed 60%, #5b8def 100%);
  color: #fff;
}

.auth-layout__brand-inner {
  max-width: 360px;
}

.auth-layout__logo {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.18);
}

.auth-layout__title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
}

.auth-layout__subtitle {
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.7;
  opacity: 0.85;
}

.auth-layout__content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.auth-layout__card {
  width: 100%;
  max-width: 400px;
  padding: 36px 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
}

@media (max-width: 860px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-layout__brand {
    padding: 32px 24px;
  }

  .auth-layout__title {
    font-size: 22px;
  }

  .auth-layout__card {
    padding: 28px 20px;
  }
}
</style>
