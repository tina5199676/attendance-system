import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as leaveService from '@/services/leaveService'
import type { LeaveDecision, LeaveFormPayload, LeaveQuery, LeaveRequest } from '@/types/leave'

export const useLeaveStore = defineStore('leave', () => {
  const requests = ref<LeaveRequest[]>([])
  const loading = ref(false)
  const error = ref('')
  const submitting = ref(false)

  const pendingCount = computed(() => requests.value.filter((item) => item.status === 'pending').length)

  async function loadRequests(query: LeaveQuery): Promise<void> {
    loading.value = true
    error.value = ''
    try {
      requests.value = await leaveService.fetchLeaveRequests(query)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '載入請假申請失敗'
    } finally {
      loading.value = false
    }
  }

  async function createRequest(userId: number, payload: LeaveFormPayload): Promise<LeaveRequest> {
    submitting.value = true
    try {
      const created = await leaveService.createLeaveRequest(userId, payload)
      // 直接插到列表最前面，不必整份重新載入
      requests.value.unshift(created)
      return created
    } finally {
      submitting.value = false
    }
  }

  async function reviewRequest(id: number, decision: LeaveDecision, comment: string): Promise<LeaveRequest> {
    submitting.value = true
    try {
      const updated = await leaveService.reviewLeaveRequest(id, decision, comment)
      const index = requests.value.findIndex((item) => item.id === id)
      if (index !== -1) requests.value[index] = updated
      return updated
    } finally {
      submitting.value = false
    }
  }

  return { requests, loading, error, submitting, pendingCount, loadRequests, createRequest, reviewRequest }
})
