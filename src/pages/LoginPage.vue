<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import { MOCK_ACCOUNTS, type MockAccount } from '@/services/mock/accounts'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/types/user'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// 表單資料與欄位錯誤用 reactive，整體狀態用 ref
const form = reactive({ email: '', password: '' })
const fieldErrors = reactive({ email: '', password: '' })
const submitError = ref('')
const loading = ref(false)

/** 前端基本驗證：只檢查必填與 email 格式，回傳是否通過 */
function validate(): boolean {
  fieldErrors.email = ''
  fieldErrors.password = ''

  if (!form.email.trim()) {
    fieldErrors.email = '請輸入電子郵件'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    fieldErrors.email = '電子郵件格式不正確'
  }

  if (!form.password) {
    fieldErrors.password = '請輸入密碼'
  }

  return !fieldErrors.email && !fieldErrors.password
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return

  loading.value = true
  submitError.value = ''

  try {
    await auth.login({ email: form.email, password: form.password })

    // 若是從受保護頁面被導來登入的，登入後回到原本要去的頁面
    const redirect = route.query.redirect
    await router.push(typeof redirect === 'string' ? redirect : { name: 'dashboard' })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '登入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

/** 開發期間的快速登入：點一下就帶入測試帳號 */
function fillDemoAccount(account: MockAccount): void {
  form.email = account.email
  form.password = account.password
  submitError.value = ''
}
</script>

<template>
  <div class="login">
    <h2 class="login__title">登入</h2>
    <p class="login__subtitle">請輸入你的帳號資訊以繼續</p>

    <form class="login__form" novalidate @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.email"
        label="電子郵件"
        type="email"
        placeholder="name@example.com"
        autocomplete="email"
        required
        :error="fieldErrors.email"
        :disabled="loading"
      />
      <BaseInput
        v-model="form.password"
        label="密碼"
        type="password"
        placeholder="請輸入密碼"
        autocomplete="current-password"
        required
        :error="fieldErrors.password"
        :disabled="loading"
      />

      <p v-if="submitError" class="login__error" role="alert">{{ submitError }}</p>

      <BaseButton type="submit" block :loading="loading">
        {{ loading ? '登入中…' : '登入' }}
      </BaseButton>
    </form>

    <section class="login__demo" aria-labelledby="demo-title">
      <h3 id="demo-title" class="login__demo-title">測試帳號（開發期間）</h3>
      <ul class="login__demo-list">
        <li v-for="account in MOCK_ACCOUNTS" :key="account.email">
          <button type="button" class="login__demo-item" :disabled="loading" @click="fillDemoAccount(account)">
            <span class="login__demo-role">{{ ROLE_LABELS[account.user.role] }}</span>
            <span class="login__demo-email">{{ account.email }}</span>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.login__title {
  font-size: 22px;
  font-weight: 700;
}

.login__subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.login__error {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  font-size: 14px;
  color: var(--color-danger);
}

.login__demo {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

.login__demo-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.login__demo-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
}

.login__demo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.login__demo-item:hover:not(:disabled) {
  background: var(--color-bg);
}

.login__demo-item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.login__demo-role {
  font-weight: 600;
}

.login__demo-email {
  color: var(--color-text-muted);
}
</style>
