import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as userService from '@/services/userService'
import type { User, UserFormPayload, UserQuery } from '@/types/user'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const enterpriseNames = ref<string[]>([])
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)

  async function loadUsers(query: UserQuery): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      users.value = await userService.fetchUsers(query)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入使用者失敗'
    } finally {
      loading.value = false
    }
  }

  async function loadEnterpriseNames(): Promise<void> {
    enterpriseNames.value = await userService.fetchEnterpriseNames()
  }

  /** 新增或更新後，用回傳的資料同步列表，避免整份重新載入 */
  function upsert(user: User): void {
    const index = users.value.findIndex((item) => item.id === user.id)
    if (index === -1) {
      users.value.unshift(user)
    } else {
      users.value[index] = user
    }
  }

  async function createUser(payload: UserFormPayload): Promise<User> {
    submitting.value = true
    try {
      const created = await userService.createUser(payload)
      upsert(created)
      return created
    } finally {
      submitting.value = false
    }
  }

  async function updateUser(id: number, payload: UserFormPayload): Promise<User> {
    submitting.value = true
    try {
      const updated = await userService.updateUser(id, payload)
      upsert(updated)
      return updated
    } finally {
      submitting.value = false
    }
  }

  async function setUserActive(id: number, isActive: boolean): Promise<User> {
    submitting.value = true
    try {
      const updated = await userService.setUserActive(id, isActive)
      upsert(updated)
      return updated
    } finally {
      submitting.value = false
    }
  }

  return {
    users,
    enterpriseNames,
    loading,
    error,
    submitting,
    loadUsers,
    loadEnterpriseNames,
    createUser,
    updateUser,
    setUserActive,
  }
})
