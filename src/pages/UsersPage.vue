<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseSelect, { type SelectOption } from '@/components/BaseSelect.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import PageHeader from '@/components/PageHeader.vue'
import UserForm from '@/components/users/UserForm.vue'
import UserTable from '@/components/users/UserTable.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useUsersStore } from '@/stores/users'
import { ROLE_LABELS, type User, type UserFormPayload, type UserQuery, type UserRole } from '@/types/user'

const auth = useAuthStore()
const users = useUsersStore()
const toast = useToastStore()

// ---- 篩選 ----
const roleFilter = ref<UserRole | ''>('')
const roleOptions: SelectOption[] = [
  { value: '', label: '全部角色' },
  ...(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => ({ value: role, label: ROLE_LABELS[role] })),
]

const activeFilter = ref<'all' | 'active' | 'inactive'>('active')
const activeOptions: SelectOption[] = [
  { value: 'active', label: '啟用中' },
  { value: 'inactive', label: '已停用' },
  { value: 'all', label: '全部狀態' },
]

const keyword = ref('')
const debouncedKeyword = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | undefined

// 關鍵字輸入用 debounce：停止輸入 300ms 後才查詢，避免每打一個字就發請求
watch(keyword, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedKeyword.value = value
  }, 300)
})

onUnmounted(() => clearTimeout(debounceTimer))

const query = computed<UserQuery>(() => ({
  role: roleFilter.value || undefined,
  keyword: debouncedKeyword.value || undefined,
  isActive: activeFilter.value === 'all' ? undefined : activeFilter.value === 'active',
}))

function loadUsers(): Promise<void> {
  return users.loadUsers(query.value)
}

watch(query, loadUsers, { immediate: true })
onMounted(() => users.loadEnterpriseNames())

// ---- 新增 / 編輯 ----
const formOpen = ref(false)
const editing = ref<User | null>(null)

function openCreate(): void {
  editing.value = null
  formOpen.value = true
}

function openEdit(user: User): void {
  editing.value = user
  formOpen.value = true
}

async function handleSubmit(payload: UserFormPayload): Promise<void> {
  try {
    if (editing.value) {
      await users.updateUser(editing.value.id, payload)
      toast.success(`已更新 ${payload.name} 的資料。`)
    } else {
      await users.createUser(payload)
      toast.success(`已新增使用者 ${payload.name}。`)
    }
    formOpen.value = false
    await users.loadEnterpriseNames()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '儲存失敗，請稍後再試')
  }
}

// ---- 停用 / 啟用（需二次確認）----
const toggling = ref<User | null>(null)

function canToggle(user: User): boolean {
  return user.id !== auth.user?.id
}

async function confirmToggle(): Promise<void> {
  if (!toggling.value) return
  const target = toggling.value
  const nextActive = !target.isActive
  try {
    await users.setUserActive(target.id, nextActive)
    toggling.value = null
    toast.success(`已${nextActive ? '啟用' : '停用'} ${target.name} 的帳號。`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '操作失敗，請稍後再試')
  }
}
</script>

<template>
  <div class="users">
    <PageHeader title="使用者管理" description="管理學員、企業與管理員帳號。停用帳號會保留歷史紀錄。">
      <template #actions>
        <BaseButton @click="openCreate">新增使用者</BaseButton>
      </template>
    </PageHeader>

    <div class="users__filters">
      <BaseInput v-model="keyword" label="搜尋" placeholder="姓名或電子郵件" class="users__search" />
      <BaseSelect v-model="roleFilter" label="角色" :options="roleOptions" />
      <BaseSelect v-model="activeFilter" label="狀態" :options="activeOptions" />
    </div>

    <LoadingState v-if="users.loading" text="載入使用者中…" />

    <EmptyState v-else-if="users.error" title="載入失敗" :description="users.error">
      <template #actions>
        <BaseButton variant="secondary" @click="loadUsers">重新載入</BaseButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="users.users.length === 0"
      title="沒有符合條件的使用者"
      description="試著調整搜尋關鍵字或篩選條件。"
    />

    <UserTable v-else :users="users.users">
      <template #actions="{ user }">
        <BaseButton variant="secondary" @click="openEdit(user)">編輯</BaseButton>
        <BaseButton
          v-if="canToggle(user)"
          :variant="user.isActive ? 'ghost' : 'secondary'"
          @click="toggling = user"
        >
          {{ user.isActive ? '停用' : '啟用' }}
        </BaseButton>
      </template>
    </UserTable>

    <BaseModal :open="formOpen" :title="editing ? '編輯使用者' : '新增使用者'" @close="formOpen = false">
      <UserForm
        v-if="formOpen"
        :user="editing"
        :enterprise-names="users.enterpriseNames"
        :submitting="users.submitting"
        @submit="handleSubmit"
        @cancel="formOpen = false"
      />
    </BaseModal>

    <BaseModal
      :open="toggling !== null"
      :title="toggling?.isActive ? '停用帳號' : '啟用帳號'"
      @close="toggling = null"
    >
      <p v-if="toggling" class="users__confirm">
        確定要{{ toggling.isActive ? '停用' : '啟用' }}
        <strong>{{ toggling.name }}</strong>
        的帳號嗎？
        <template v-if="toggling.isActive">停用後將無法登入，但出勤與請假紀錄會保留。</template>
      </p>
      <template #footer>
        <BaseButton variant="secondary" :disabled="users.submitting" @click="toggling = null">取消</BaseButton>
        <BaseButton
          :variant="toggling?.isActive ? 'danger' : 'primary'"
          :loading="users.submitting"
          @click="confirmToggle"
        >
          確定{{ toggling?.isActive ? '停用' : '啟用' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.users__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 16px;
}

.users__search {
  flex: 1 1 220px;
  max-width: 320px;
}

.users__confirm {
  font-size: 15px;
  line-height: 1.7;
}
</style>
