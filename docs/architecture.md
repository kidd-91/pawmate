---
# Internal doc — excluded from GitHub Pages by docs/_config.yml
---

# DogBond 技術架構文件

> 為養狗的人打造的社交 App。
> 這份文件描述系統的整體架構、技術選型、資料模型、與第三方整合。
> 程式碼路徑均為相對於專案根目錄。

---

## 1. 專案概述

DogBond（前身 PawMate，2026-04-30 改名）是一個讓飼主：

- 為自家狗狗建立檔案 → 與其他狗狗滑卡配對
- 配對成功後私訊聊天，約散步
- 追蹤毛孩健康紀錄（疫苗、用藥、看診、體重）
- 記錄毛孩相關開銷（飼料、看診、美容⋯）

**目標市場**：台灣（介面、地圖、距離單位皆以台灣為主）
**目標平台**：Android（Google Play）優先；iOS / Web 並行
**目前階段**：Phase 2.6 完成，準備上架 Google Play（2026-05）

---

## 2. 技術棧

### 2.1 前端（Mobile + Web）

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| Framework | Expo | ~54.0.33 | RN 開發環境、build 服務（EAS） |
| Runtime | React Native | 0.81.5 | iOS/Android 原生渲染 |
| UI Layer | React | 19.1.0 | 元件模型 |
| 路由 | expo-router | ~6.0.23 | 檔案系統路由（類 Next.js） |
| UI 元件 | react-native-paper | ^5.15.0 | Material Design 元件庫 |
| 狀態管理 | zustand | ^5.0.12 | 輕量 store（取代 Redux） |
| 後端通訊 | @supabase/supabase-js | ^2.103.0 | Supabase Auth + Storage + Postgres |
| Session 持久化 | AsyncStorage | 2.2.0 | 自動登入用 |
| 地圖 | react-native-maps | 1.20.1 | 附近狗友地圖檢視 |
| 定位 | expo-location | ~19.0.8 | 取得 GPS 座標 |
| OAuth | expo-web-browser | ~15.0.11 | Google 登入跳轉外部瀏覽器 |
| 圖片選取 | expo-image-picker | ~17.0.10 | 上傳狗狗照片 |
| 動畫 | react-native-reanimated | ~4.1.1 | 滑卡動畫 |
| 向量圖 | react-native-svg | 15.12.1 | Google logo 等向量圖示 |

**型別系統**：TypeScript 5.9.2（strict mode）

### 2.2 後端（API Server）

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| Runtime | Node.js | 18+ | 伺服器執行環境 |
| Framework | Express | ^4.21.0 | HTTP 路由 |
| 語言 | TypeScript | ^5.6.0 | 型別檢查 |
| Dev | tsx | ^4.19.0 | TS 直接執行（取代 ts-node） |
| DB Client | @supabase/supabase-js | ^2.103.0 | Service role 操作 |
| CORS | cors | ^2.8.5 | 跨域支援 |
| 檔案上傳 | multer | ^1.4.5-lts.1 | multipart/form-data |
| 環境變數 | dotenv | ^17.4.2 | 本地開發載入 .env |

### 2.3 後端基礎設施

| 服務 | 角色 | 方案 |
|------|------|------|
| Supabase | Postgres / Auth / Storage / RLS | Free tier |
| Render | Express API hosting | Free tier（自動 cold start） |
| GitHub Pages | 隱私權政策 / 服務條款 | Free（jekyll renderer） |
| Google Cloud | OAuth 2.0 Client | Free（quota 內） |
| EAS（Expo） | Android / iOS build 服務 | Free tier（每月 30 次） |

---

## 3. 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (DogBond App)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Android     │  │   iOS        │  │  Web (Expo Web)  │  │
│  │  (com.kidd91│  │   (未上架)   │  │  (測試 / 截圖用) │  │
│  │   .dogbond)  │  │              │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                  │                   │             │
│         └──────────────────┴───────────────────┘             │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             │ HTTPS
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌──────────────────┐   ┌────────────┐
│   Supabase    │   │  Express API     │   │  Google    │
│   (主要 DB)    │◄──┤  (Render)        │   │  OAuth 2.0 │
│               │   │                  │   │            │
│  ┌─────────┐  │   │  - /api/dogs     │   │  Web       │
│  │ Auth    │  │   │  - /api/swipes   │   │  Client    │
│  │ + RLS   │  │   │  - /api/matches  │   │  → 回調    │
│  ├─────────┤  │   │  - /api/messages │   │   Supabase │
│  │ Postgres│  │   │  - /api/expenses │   └────────────┘
│  │ + PostGIS│ │   │  - /api/health   │
│  ├─────────┤  │   │  - /api/upload   │
│  │ Storage │  │   │  - /api/auth/me  │
│  └─────────┘  │   │  ...             │
└───────────────┘   └──────────────────┘
        │                    │
        │                    │ (Service Role Key)
        │                    │
        └────────────────────┘
```

**通訊模式**：
- 客戶端**直接連 Supabase**（讀資料、上傳照片）— 用 anon key + RLS 保護
- 客戶端**透過 Express**（複雜邏輯、跨表查詢、需要 service_role 的操作）— 例如刪除帳號
- Google OAuth 流程：Client → Google → Supabase callback → Client

---

## 4. 前端結構

### 4.1 目錄結構

```
/
├── app/                      # expo-router 路由（檔案系統路由）
│   ├── _layout.tsx           # 根 layout（Theme、Auth gate）
│   ├── (auth)/               # 未登入路由群組
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/               # 已登入路由群組（4 tabs）
│       ├── _layout.tsx       # Tab bar 設定
│       ├── explore.tsx       # 探索（滑卡 + 附近）
│       ├── chat.tsx          # 聊天列表
│       ├── dogs.tsx          # 我的狗狗
│       ├── notifications.tsx # 通知中心
│       └── profile.tsx       # 我（含刪除帳號）
├── components/               # 可重用元件
│   ├── DogCard.tsx           # 滑卡的卡片
│   ├── GoogleIcon.tsx        # Google 4 色 G logo
│   └── ...
├── stores/                   # zustand stores
│   ├── authStore.ts          # 登入狀態 + 帳號刪除
│   ├── dogStore.ts
│   ├── healthStore.ts
│   ├── expenseStore.ts
│   └── ...
├── lib/                      # 工具函式
│   ├── supabase.ts           # Supabase client + Platform 判斷
│   ├── googleAuth.ts         # Google OAuth helper
│   └── api.ts                # Express API wrapper
├── constants/
│   └── theme.ts              # 顏色 / spacing tokens
├── types/
│   └── index.ts              # Dog, Profile, Match 等 TS 型別
├── assets/
│   ├── icon.png              # App icon
│   ├── adaptive-icon.png     # Android adaptive
│   ├── splash-icon.png       # Splash screen
│   └── playstore/            # Play Store 素材
└── app.json                  # Expo 設定
```

### 4.2 路由結構

expo-router 用**檔案系統路由**：

| 路徑 | 檔案 | 用途 |
|------|------|------|
| `/(auth)/login` | `app/(auth)/login.tsx` | 登入（Email + Google） |
| `/(auth)/register` | `app/(auth)/register.tsx` | 註冊 |
| `/(tabs)/explore` | `app/(tabs)/explore.tsx` | Tab 1: 滑卡 + 附近 |
| `/(tabs)/chat` | `app/(tabs)/chat.tsx` | Tab 2: 聊天列表 |
| `/(tabs)/dogs` | `app/(tabs)/dogs.tsx` | Tab 3: 我的狗狗（dashboard） |
| `/(tabs)/notifications` | `app/(tabs)/notifications.tsx` | 通知中心（鈴鐺） |
| `/(tabs)/profile` | `app/(tabs)/profile.tsx` | Tab 4: 我 |

**路由群組**：`(auth)` 和 `(tabs)` 用括號表示**只是組織用**，URL 不包含括號。

**Auth Gate**：`app/_layout.tsx` 偵測 session，未登入 → redirect 到 `/(auth)/login`，已登入 → redirect 到 `/(tabs)/explore`。

### 4.3 狀態管理（zustand）

每個領域獨立 store，沒有大一統 root store：

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  session: Session | null;
  signIn: (email, password) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email, password, displayName) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;  // 呼叫 backend /api/auth/me DELETE
}
```

Stores 之間**不互相 import**，避免循環依賴。跨 store 的資料用 React 元件層組合。

---

## 5. 後端 API

### 5.1 路由一覽

```
backend/src/routes/
├── auth.ts        # POST /register, GET /me, DELETE /me
├── profiles.ts    # GET /:id, PATCH /:id
├── dogs.ts        # CRUD /api/dogs
├── swipes.ts      # POST /api/swipes（含配對邏輯）
├── matches.ts     # GET /api/matches
├── chat.ts        # GET /api/chat/:matchId, POST /api/chat
├── expenses.ts    # CRUD + 月統計
├── health.ts      # CRUD + dismiss 提醒
├── map.ts         # GET /api/map/nearby（依 GPS 找附近狗）
└── upload.ts      # POST /api/upload（圖片上傳到 Supabase Storage）
```

### 5.2 認證流程

所有 `/api/*`（除了 `/api/auth/register`）都過 `authMiddleware`：

```typescript
// 1. 從 Authorization header 拿 Bearer token
// 2. 用 supabaseAdmin.auth.getUser(token) 驗證
// 3. 把 user.id 塞進 req.userId
// 4. 後續路由用 req.userId 撈資料 + 檢查權限
```

**Anon vs Service Role**：
- 客戶端用 `SUPABASE_ANON_KEY`（受 RLS 保護）
- Backend 用 `SUPABASE_SERVICE_ROLE_KEY`（繞過 RLS，但要自己檢查權限）

### 5.3 部署

- **Production**：Render 自動從 GitHub `main` branch 部署
- **Cold start**：免費方案閒置 15 分鐘後 sleep，第一次請求會 ~30 秒延遲
- **環境變數**：在 Render Dashboard 設定（`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`）

---

## 6. 資料庫 Schema

### 6.1 Migration 演進史

`supabase/migrations/` 下用編號命名，按時間順序執行：

| Migration | 說明 |
|-----------|------|
| 001 | 初始 schema：profiles、dogs、swipes、matches、messages |
| 002 | Storage RLS policies（dog-photos bucket） |
| 003 | profiles 加 location（lat / lng / city / district） |
| 004 | dogs 加散步偏好（preferred_walk_time、walk_duration） |
| 005 | walk_groups（後來廢棄，見 013） |
| 006 | RPC: nearby_dogs（PostGIS ST_Distance） |
| 007 | walking_spots（地圖標記） |
| 008 | lookup tables（breeds、personalities、health_types） |
| 009 | user_matches view（聚合配對 + 最新訊息） |
| 010 | expenses |
| 011 | health_records + health_reminders |
| 012 | health_types 表清理 |
| 013 | DROP walk_groups（改用即時配對） |
| 014 | trigger handle_new_user：auth.users INSERT → 自動建 profile |
| 015 | reminder dedupe（已 revert，見 016） |
| 016 | health_reminders 加 dismissed_at（手動關閉提醒） |
| 017 | Security Advisor 修補（function search_path、REVOKE PUBLIC） |
| 018 | 顯式 REVOKE / GRANT to anon/authenticated/service_role |

### 6.2 主要表格

```
auth.users (Supabase 內建)
  └─ profiles (1:1, ON DELETE CASCADE via trigger)
       └─ dogs (1:N, owner_id → profiles.id)
            ├─ swipes (狗 swipe 狗)
            ├─ matches (雙向喜歡產生)
            │    └─ messages
            ├─ expenses
            ├─ health_records
            └─ health_reminders (有 dismissed_at)
```

**重要設計**：
- 全鏈 ON DELETE CASCADE — 刪 `auth.users` 會自動清光所有相關資料
- 帳號刪除靠 `supabaseAdmin.auth.admin.deleteUser()` 觸發整條 cascade

### 6.3 PostGIS

- profiles 有 `location GEOGRAPHY(POINT, 4326)`
- 附近搜尋用 RPC `nearby_dogs(user_lat, user_lng, radius_km)` → `ST_DWithin`
- 注意：Migration 017 試圖對 `spatial_ref_sys` 加 RLS 失敗（PostGIS 內建表，非 owner）— 已知限制，無解

### 6.4 RLS 策略

每張 user-owned 表都有 RLS：

```sql
-- 例：dogs
CREATE POLICY "Users can view all dogs"
  ON dogs FOR SELECT USING (true);  -- 公開瀏覽

CREATE POLICY "Users can manage own dogs"
  ON dogs FOR ALL USING (auth.uid() = owner_id);
```

Backend 走 service_role 繞過 RLS，但所有 routes 自己檢查 `req.userId === resource.owner_id`。

---

## 7. 認證流程

### 7.1 Email + Password

```
Client                    Supabase                    DB Trigger
  │                          │                           │
  │  signUp(email, pw,       │                           │
  │   metadata.display_name) │                           │
  │─────────────────────────►│                           │
  │                          │ INSERT auth.users         │
  │                          │──────────────────────────►│
  │                          │                           │ handle_new_user
  │                          │                           │ INSERT profiles
  │                          │◄──────────────────────────│  (id, display_name)
  │                          │                           │
  │  寄驗證信（Supabase 預設    │                           │
  │   SMTP，4 封/小時上限）   │                           │
  │◄─────────────────────────│                           │
```

**display_name 解析優先順序**（migration 014）：
1. `raw_user_meta_data.display_name`（Email 註冊填的）
2. `raw_user_meta_data.full_name`（Google 給的）
3. `raw_user_meta_data.name`（其他 OAuth）
4. `split_part(email, '@', 1)`（fallback）

### 7.2 Google OAuth

```
Client                                     Google                  Supabase
  │                                           │                       │
  │  signInWithGoogle()                       │                       │
  │──── expo-web-browser 開外部瀏覽器 ──────►│                       │
  │                                           │  使用者選帳號          │
  │                                           │   + 同意授權           │
  │                                           │                       │
  │                                           │  redirect →           │
  │                                           │   supabase.co/        │
  │                                           │   auth/v1/callback    │
  │                                           │──────────────────────►│
  │                                           │                       │
  │                                           │                       │ 建立或合併 user
  │                                           │                       │ (by email)
  │                                           │                       │ trigger 建 profile
  │                                           │                       │
  │  ◄──── deep link 回 dogbond:// ──────────────────────────────────│
  │                                                                   │
  │  Session 建立（AsyncStorage 持久化）                              │
```

**設定**：
- Google Cloud Web Application client（不是 Android！）
- Authorized redirect URI: `https://ykckeqhmyligkskpvhrr.supabase.co/auth/v1/callback`
- Authorized domain: `kidd-91.github.io`
- Client ID + Secret 設定在 Supabase Dashboard → Authentication → Providers → Google

### 7.3 帳號刪除（Google Play 2024 政策必要）

```
Client → DELETE /api/auth/me
         ├─ 過 authMiddleware → 拿 req.userId
         └─ supabaseAdmin.auth.admin.deleteUser(userId)
                ↓
         觸發 ON DELETE CASCADE
                ↓
         auth.users → profiles → dogs → swipes/matches/messages
                                      → expenses
                                      → health_records
                                      → health_reminders
         所有資料刪光
```

UI 進入點：[app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) 的 dangerZone 區塊（紅色文字 + 二段確認）。

---

## 8. 第三方整合

### 8.1 Supabase

- **Project URL**: `https://ykckeqhmyligkskpvhrr.supabase.co`
- **方案**: Free tier
- **限制**:
  - DB: 500 MB
  - Storage: 1 GB
  - Auth users: 50,000
  - Egress: 5 GB/月（**主要瓶頸**，狗狗照片佔大宗）
- **預估容量**: ~200 active users/month（egress 上限）
- **升級**: Pro $25/month → 8 GB DB / 100 GB storage / 250 GB egress

### 8.2 Google OAuth

- **Project**: DogBond
- **Client Type**: Web application（給 Supabase callback 用）
- **同意畫面**: External + Production
- **驗證狀態**: 待提交（2026-05-11 之後）
- **未驗證限制**: 100 users，超過要送 Google 審核（1-2 週）

### 8.3 GitHub Pages

- **URL**: https://kidd-91.github.io/pawmate/
- **Renderer**: Jekyll（minima theme）
- **內容**: index.md、legal/privacy.md、legal/terms.md
- **Exclude**: redesign-plan.md、play-store-listing.md、architecture.md（內部文件）

### 8.4 Render（Backend hosting）

- **Service**: Web Service（從 GitHub auto-deploy）
- **方案**: Free tier
- **限制**:
  - 750 小時/月（自動 sleep 後不算）
  - Cold start ~30 秒
  - 512 MB RAM
- **環境變數**: SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY

### 8.5 EAS（Expo Build）

- **Project ID**: `37b070cd-09ac-4cab-84d4-9358a95ea6e9`
- **Owner**: kidd-91
- **方案**: Free tier（每月 30 次 build）
- **指令**: `eas build --platform android --profile production` → 出 .aab

### 8.6 已停用

- **Brevo SMTP**: 註冊但未啟用。原因：sender 用 `@gmail.com` 被 Gmail DMARC 擋。需要自己網域才能啟用。Email 驗證信目前走 Supabase 預設 SMTP（4 封/小時上限）。

---

## 9. 環境設定

### 9.1 必要的環境變數

**Frontend** (`.env`):
```
EXPO_PUBLIC_SUPABASE_URL=https://ykckeqhmyligkskpvhrr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key>
EXPO_PUBLIC_API_URL=https://dogbond-api.onrender.com  # production
# 本地開發改成 http://localhost:3000
```

**Backend** (`.env`):
```
SUPABASE_URL=https://ykckeqhmyligkskpvhrr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
PORT=3000
```

### 9.2 本地開發

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev  # tsx watch src/index.ts

# Terminal 2: Frontend
npm install
npx expo start
# 按 w 開 web，按 a 開 Android emulator
```

### 9.3 部署流程

**Backend → Render**:
- Push 到 GitHub `main` → Render 自動 build + deploy

**Frontend → Google Play**:
1. Bump `app.json` 的 `version` 和 `android.versionCode`
2. `eas build --platform android --profile production`
3. 等 EAS build 完成（20-40 分鐘）
4. 下載 `.aab` 檔
5. Play Console → 正式版 → 建立新版本 → 上傳 .aab → 送審

---

## 10. 安全機制

### 10.1 已實作

- ✅ RLS on 所有 user-owned 表
- ✅ Function `SET search_path` 防 search_path attack
- ✅ REVOKE EXECUTE FROM PUBLIC / anon / authenticated（除了刻意公開的 RPC）
- ✅ HTTPS 全程（Supabase + Render 預設 TLS）
- ✅ Bearer token 驗證（不是 cookie，避免 CSRF）
- ✅ Backend 路由顯式檢查 `req.userId === resource.owner_id`
- ✅ Storage bucket public 但 INSERT/UPDATE/DELETE 限本人

### 10.2 已知未解

- ⚠️ Supabase Security Advisor 剩 12 issues（PostGIS 內建 / Pro-only / 故意保留）
- ⚠️ 沒有 rate limiting（依賴 Supabase / Render 平台層）
- ⚠️ 沒有監控 / alerting（Free tier 限制）

### 10.3 隱私

- 收集：display_name、email、location（粗略）、照片、訊息、活動紀錄
- **不分享**給第三方
- 使用者可隨時 in-app 刪除帳號 → 全部 cascade delete
- 隱私權政策：https://kidd-91.github.io/pawmate/legal/privacy/

---

## 11. 已知限制與待辦

### 11.1 上架前必做

- [ ] 提交 Google OAuth 驗證（解除「未驗證 App」警告）
- [ ] EAS production build 出 .aab
- [ ] Play Console 註冊 + 上架（身分驗證 2-3 天）

### 11.2 上架後優先

- [ ] 買網域 + 接 Brevo SMTP（解 4 封/小時限制）
- [ ] Phase 3：Android 推播通知（FCM 免費）
- [ ] 監控 / 錯誤回報（Sentry free tier）

### 11.3 長期

- [ ] iOS 上架（$99/年 + 比 Android 嚴格的審核）
- [ ] 升級 Supabase Pro（活躍用戶 > 200 時）
- [ ] 升級 Render Starter（避免 cold start）

---

## 12. 重要檔案速查

| 檔案 | 說明 |
|------|------|
| [app.json](../app.json) | Expo 設定（package、版本、權限） |
| [eas.json](../eas.json) | EAS build profiles |
| [package.json](../package.json) | Frontend dependencies |
| [backend/package.json](../backend/package.json) | Backend dependencies |
| [supabase/migrations/](../supabase/migrations/) | DB schema 演進史 |
| [lib/supabase.ts](../lib/supabase.ts) | Supabase client 初始化 |
| [lib/googleAuth.ts](../lib/googleAuth.ts) | Google OAuth helper |
| [stores/authStore.ts](../stores/authStore.ts) | 登入 / 帳號刪除 |
| [components/DogCard.tsx](../components/DogCard.tsx) | 滑卡 UI（CARD_HEIGHT 比例 1.2） |
| [docs/play-store-listing.md](play-store-listing.md) | Play Store 商店頁文案 |
| [docs/legal/privacy.md](legal/privacy.md) | 隱私權政策（公開到 GitHub Pages） |
| [docs/legal/terms.md](legal/terms.md) | 服務條款（公開到 GitHub Pages） |

---

## 13. 名詞對照

| 中文 | 英文 / 縮寫 |
|------|------------|
| 滑卡 | swipe |
| 配對 | match |
| 喜歡 | like |
| 通知中心 | notifications |
| 行為偏好 | personality / traits |
| 散步 | walk |
| 健康紀錄 | health records |
| 健康提醒 | health reminders |
| 開銷 | expenses |
| Row Level Security | RLS |
| App Bundle | .aab（Android Play Store 格式） |
| Apple Push / Google FCM | 推播通知 |

---

*最後更新：2026-05-11*
*專案版本：v1.0.0（android.versionCode = 1）*
