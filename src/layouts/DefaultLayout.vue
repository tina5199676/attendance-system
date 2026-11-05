<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/types/user'

const router = useRouter()
const auth = useAuthStore()
const loggingOut = ref(false)

/**
 * 側邊導覽直接從路由設定產生：
 * 有 navOrder 的路由才顯示，並依目前角色過濾掉沒有權限的項目。
 * 這樣新增頁面時只要改 router，不必再同步維護一份導覽清單。
 */
const navItems = computed(() =>
  router
    .getRoutes()
    .filter(
      (route) =>
        route.name !== undefined &&
        route.meta.navOrder !== undefined &&
        (route.meta.roles === undefined || auth.hasRole(route.meta.roles)),
    )
    .sort((a, b) => (a.meta.navOrder ?? 0) - (b.meta.navOrder ?? 0))
    .map((route) => ({ name: route.name, title: route.meta.title ?? '' })),
)

const roleLabel = computed(() => (auth.role ? ROLE_LABELS[auth.role] : ''))

async function handleLogout(): Promise<void> {
  loggingOut.value = true
  try {
    await auth.logout()
    await router.push({ name: 'login' })
  } finally {
    loggingOut.value = false
  }
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <RouterLink :to="{ name: 'dashboard' }" class="sidebar__brand">
        <span class="sidebar__logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        <span class="sidebar__brand-text">出勤管理系統</span>
      </RouterLink>

      <nav class="sidebar__nav" aria-label="主要導覽">
        <RouterLink
          v-for="item in navItems"
          :key="String(item.name)"
          :to="{ name: item.name }"
          class="sidebar__link"
          active-class="sidebar__link--active"
        >
          {{ item.title }}
        </RouterLink>
      </nav>

      <div v-if="auth.user" class="sidebar__user">
        <div class="sidebar__avatar" aria-hidden="true">{{ auth.user.name.charAt(0) }}</div>
        <div class="sidebar__user-info">
          <p class="sidebar__user-name">{{ auth.user.name }}</p>
          <p class="sidebar__user-role">{{ roleLabel }}</p>
        </div>
        <BaseButton variant="ghost" :loading="loggingOut" @click="handleLogout">登出</BaseButton>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  height: 100vh;
  padding: 20px 16px;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 22px;
  font-weight: 700;
}

.sidebar__logo {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar__link {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.sidebar__link:hover {
  background: var(--color-bg);
  color: var(--color-text);
}

.sidebar__link--active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.sidebar__avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 700;
  flex-shrink: 0;
}

.sidebar__user-info {
  flex: 1;
  min-width: 0;
}

.sidebar__user-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__user-role {
  font-size: 12px;
  color: var(--color-text-muted);
}

.content {
  flex: 1;
  min-width: 0;
  padding: 32px;
}

@media (max-width: 860px) {
  .layout {
    flex-direction: column;
  }

  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    padding: 12px 16px;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .sidebar__brand {
    padding-bottom: 12px;
  }

  .sidebar__nav {
    flex-direction: row;
    flex-wrap: wrap;
    padding-bottom: 12px;
  }

  .sidebar__user {
    padding-top: 12px;
  }

  .content {
    padding: 20px 16px;
  }
}
</style>
