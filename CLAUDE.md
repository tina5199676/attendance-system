
# 專案開發指引（Claude Code）

## 一、專案介紹

本專案為出勤管理系統（Attendance Management System）。

專案目標是建立一套具備登入驗證、角色權限、出勤紀錄、請假申請及使用者管理功能的 Web Application。

### 使用者角色

- 學員（Student）：查看個人出勤紀錄、上下班打卡、提出請假申請。
- 企業（Enterprise）：查看所屬學員的出勤及請假資訊。
- 系統管理員（Admin）：管理使用者、出勤紀錄及請假審核。

## 二、技術架構

### Frontend
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- CSS

### Backend
- Python
- Django REST Framework
- SQLite

注意：前後端 API 尚未完成確認，不得自行假設 API 路徑、資料格式或驗證方式。

## 三、開發規範

1. 使用 Vue 3 Composition API。
2. Vue 元件統一使用 `<script setup lang="ts">`。
3. 使用 TypeScript，避免使用 `any`。
4. 使用 Vue Router 管理頁面路由。
5. 使用 Pinia 管理全域狀態。
6. 使用 Axios 處理 API 請求。
7. 元件應保持單一職責，避免過度複雜。
8. 優先重複利用共用元件。
9. 遵循現有資料夾架構。
10. 未經確認不得任意增加依賴套件。
11. 不得任意修改與當前任務無關的檔案。

## 四、資料夾架構

src/
- assets/：圖片、圖示及靜態資源
- components/：共用 UI 元件
- layouts/：頁面整體版型
- pages/：各功能頁面
- router/：路由設定
- services/：API 串接及服務
- stores/：Pinia 狀態管理
- types/：TypeScript 型別定義

## 五、Claude Code 協作規範

1. 開發前先閱讀相關檔案，理解目前專案架構。
2. 每次只處理一個明確的小任務。
3. 修改程式碼前，先說明預計修改的檔案及原因。
4. 完成後說明修改內容及重要程式概念。
5. 使用繁體中文解釋技術概念。
6. 不得在未經確認的情況下重構整個專案。
7. 不得擅自刪除既有功能。
8. 遇到不確定的需求或 API 規格時，先詢問，不得自行捏造。
9. 遇到危險操作（刪除檔案、改寫 Git 歷史、強制推送、修改系統設定等）或需要接觸敏感資料（鑰匙圈、密碼、Token、.env、個資等）時，必須先詢問專案負責人，取得同意後才能執行。

## 六、學習與程式碼品質

本專案同時作為前端工程能力與 UI/UX 設計能力的作品集。

開發時請協助專案負責人理解：

- Vue 3 Composition API 的使用方式
- TypeScript 型別設計
- 元件拆分與重複使用
- 前端路由與權限控制
- Pinia 狀態管理
- Axios 與 RESTful API 串接
- 錯誤處理及使用者操作回饋

避免只提供可以執行但無法理解的程式碼。

## 七、Git 與 AI 協作

1. Commit 作者依實際撰寫者決定，讓 GitHub Contributors 同時呈現專案負責人與 Claude：
   - 程式碼主要由 Claude 撰寫：作者為 Claude Fable 5.1 <noreply@anthropic.com>，專案負責人掛 Co-Authored-By。
   - 程式碼由專案負責人撰寫或主導修改：作者為專案負責人，Claude 視參與程度掛 Co-Authored-By。
2. 每筆 Claude 參與的 Commit 都必須保留另一方的 Co-Authored-By attribution。
3. 使用 Conventional Commits 格式。
4. Commit 類型使用 feat、fix、docs、refactor、test、chore。
5. 提交前檢查 git diff。
6. 未經確認不得自行 Push 或修改既有 Commit。

## 八、開發原則

- 先完成 MVP，再逐步擴充功能。
- 優先考慮程式碼可讀性與維護性。
- 不為了展示技術而增加不必要的複雜度。
- 每個功能都應具備基本的 Loading、Error、Empty、Success 狀態。
- 開發完成後應確認功能可正常運作。
