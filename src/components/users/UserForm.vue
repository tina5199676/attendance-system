<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect, { type SelectOption } from '@/components/BaseSelect.vue'
import { ROLE_LABELS, type User, type UserFormPayload, type UserRole } from '@/types/user'

/**
 * 使用者表單：新增與編輯共用。
 * 傳入 user 代表編輯模式，表單會帶入既有資料；未傳入則為新增。
 */
const props = defineProps<{
  user?: User | null
  enterpriseNames: string[]
  submitting: boolean
}>()

const emit = defineEmits<{
  submit: [payload: UserFormPayload]
  cancel: []
}>()

const roleOptions: SelectOption[] = (Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({
  value: role,
  label: ROLE_LABELS[role],
}))

const form = reactive<UserFormPayload>({
  name: '',
  email: '',
  role: 'student',
  enterpriseName: null,
})

const errors = reactive({ name: '', email: '', enterpriseName: '' })

// 編輯模式：props.user 一變就把資料帶進表單
watch(
  () => props.user,
  (user) => {
    form.name = user?.name ?? ''
    form.email = user?.email ?? ''
    form.role = user?.role ?? 'student'
    form.enterpriseName = user?.enterpriseName ?? null
  },
  { immediate: true },
)

const needsEnterprise = computed(() => form.role !== 'admin')

const enterpriseOptions = computed<SelectOption[]>(() => [
  { value: '', label: '請選擇企業' },
  ...props.enterpriseNames.map((name) => ({ value: name, label: name })),
])

// BaseSelect 的值是 string，這裡在 '' 與 null 之間轉換
const enterpriseValue = computed<string>({
  get: () => form.enterpriseName ?? '',
  set: (value) => {
    form.enterpriseName = value || null
  },
})

function validate(): boolean {
  errors.name = form.name.trim() ? '' : '請輸入姓名'
  errors.email = !form.email.trim()
    ? '請輸入電子郵件'
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ? ''
      : '電子郵件格式不正確'
  errors.enterpriseName = needsEnterprise.value && !form.enterpriseName ? '學員與企業帳號必須選擇所屬企業' : ''
  return !errors.name && !errors.email && !errors.enterpriseName
}

function handleSubmit(): void {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>

<template>
  <form class="user-form" novalidate @submit.prevent="handleSubmit">
    <BaseInput v-model="form.name" label="姓名" required :error="errors.name" :disabled="submitting" />
    <BaseInput v-model="form.email" label="電子郵件" type="email" required :error="errors.email" :disabled="submitting" />
    <BaseSelect v-model="form.role" label="角色" :options="roleOptions" :disabled="submitting" />

    <div v-if="needsEnterprise" class="user-form__enterprise" :class="{ 'user-form__enterprise--error': errors.enterpriseName }">
      <BaseSelect v-model="enterpriseValue" label="所屬企業" :options="enterpriseOptions" :disabled="submitting" />
      <p v-if="errors.enterpriseName" class="user-form__error" role="alert">{{ errors.enterpriseName }}</p>
    </div>

    <div class="user-form__actions">
      <BaseButton variant="secondary" :disabled="submitting" @click="emit('cancel')">取消</BaseButton>
      <BaseButton type="submit" :loading="submitting">{{ user ? '儲存變更' : '新增使用者' }}</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-form__enterprise {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-form__enterprise :deep(.select__control) {
  width: 100%;
}

.user-form__error {
  font-size: 13px;
  color: var(--color-danger);
}

.user-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
</style>
