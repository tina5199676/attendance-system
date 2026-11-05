# 出勤管理系統（Attendance Management System）

以 Vue 3 + TypeScript 打造的出勤管理前端作品集，涵蓋登入驗證、角色權限、出勤打卡、請假審核與使用者管理。

本專案為純前端作品，沒有真實後端：所有資料由 `src/services/mock/` 的假資料提供，`services/` 層以非同步函式模擬 API 呼叫，保留未來可直接替換為真實 API 的介面。

## 功能總覽

| 功能 | 學員 | 企業 | 系統管理員 |
| --- | :-: | :-: | :-: |
| 登入、登出、重新整理保持登入 | ✓ | ✓ | ✓ |
| 總覽（依角色顯示不同摘要） | ✓ | ✓ | ✓ |
| 上下班打卡（自動判定遲到、早退） | ✓ | | |
| 出勤紀錄查詢（月份、學員篩選） | 個人 | 所屬學員 | 全部 |
| 請假申請 | ✓ | | |
| 請假查詢（狀態頁籤） | 個人 | 所屬學員 | 全部 |
| 請假審核（核准、駁回、審核意見） | | | ✓ |
| 使用者管理（新增、編輯、停用） | | | ✓ |

每個資料頁面都具備 Loading、Error（可重試）、Empty、Success 四種狀態，操作結果以 Toast 回饋。

## 測試帳號

密碼皆為 `demo1234`。

| 角色 | 帳號 |
| --- | --- |
| 學員 | student@demo.com |
| 企業 | enterprise@demo.com |
| 系統管理員 | admin@demo.com |

## 技術架構

- Vue 3（Composition API、`<script setup lang="ts">`）
- TypeScript（嚴格模式，不使用 `any`）
- Vite
- Vue Router（巢狀版型、全域守衛處理登入與角色權限）
- Pinia（setup store 寫法）
- Axios（已建立共用實例，預留串接真實 API）
- 原生 CSS（設計 token 集中於 `src/style.css`，元件使用 scoped CSS）

## 開始使用

```bash
npm install
npm run dev      # 開發伺服器 http://localhost:5173
npm run build    # 型別檢查 + 正式建置
npm run preview  # 預覽建置結果
```

## 專案結構

```
src/
├── assets/        靜態資源
├── components/    共用 UI 元件（BaseButton、BaseInput、BaseModal、StatusBadge…）
│   ├── attendance/  出勤功能元件
│   ├── leave/       請假功能元件
│   └── users/       使用者管理元件
├── layouts/       AuthLayout（登入）、DefaultLayout（側邊導覽）
├── pages/         各功能頁面
├── router/        路由設定與權限守衛
├── services/      API 服務層（目前為 mock 實作）
│   └── mock/        假資料與資料產生器
├── stores/        Pinia 狀態（auth、attendance、leave、users、toast）
├── types/         TypeScript 型別定義
└── utils/         純函式工具（日期處理）
```

## 設計重點

- **路由即權限設定**：每條路由的 `meta` 宣告 `requiresAuth`、`roles`、`navOrder`，全域守衛依此導向，側邊導覽也直接從路由產生，新增頁面不需另外維護清單。
- **服務層隔離假資料**：頁面與 store 只依賴 `services/` 的函式簽章，假資料產生器使用固定種子，每次重新整理畫面一致，方便展示。
- **狀態集中於 Pinia**：資料、載入中、錯誤與摘要統計放在 store，頁面只負責組合查詢條件與呈現。
- **元件單一職責**：表單元件只負責欄位與驗證，透過 `emit` 交由頁面呼叫 API；表格元件以 scoped slot 讓不同角色放入不同操作按鈕。
- **操作回饋**：全站 Toast 由 Pinia store 驅動，任何頁面呼叫 `toast.success()` 即可顯示。

## 開發協作

本專案由專案負責人與 Claude Code 共同開發，Commit 依實際撰寫者署名並互相保留 Co-Authored-By，詳見 `CLAUDE.md`。
