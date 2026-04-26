# PawMate 上架前改版計畫

> 規劃日期：2026-04-23
> 目標：將 PawMate 從「功能齊全但無特點的養狗社交 App」收斂為「養狗想認識人」的雙軸 App，準備上架。

---

## 一、產品定位

**目標族群**：有養狗、想認識同樣愛狗的人的飼主。

**雙軸策略**：
- **社交軸**：探索附近狗友 + 配對 + 私訊（解「想認識人」需求）
- **管理軸**：每天打開記錄狗狗健康與花費（解 cold start / retention）

---

## 二、介面結構（6 tab → 4 tab）

| Tab | 內容 | 角色 |
|---|---|---|
| **探索** | 地圖（附近狗友 + presence）+ 滑卡配對 | 認識人入口 |
| **聊天** | 個人私訊 | 維繫關係 |
| **狗狗** | 狗狗檔案 + 健康提醒 + 記帳 | 每日 hook |
| **我** | 個人資料 / 設定 | — |

---

## 三、功能異動

### 移除
- **揪團（walk_groups）**：認識後直接私訊約即可。`walk_groups` / `walk_group_members` / `walk_group_messages` 三張表暫時保留，等 UI 完全切換後再 drop。

### 新增

#### 記帳
- 支援單狗記帳與多狗共用（一袋飼料兩隻一起吃，預設平均分攤）
- 類別：飼料 / 醫療 / 美容 / 寄宿 / 玩具 / 零食 / 其他（系統預設 + 使用者自訂）
- 發票辨識：先做台灣電子發票 QR code 掃描；之後可加 Apple Vision / Google Cloud Vision / Claude Vision
- Schema 預留多人共記（Splitwise 風格），UI 一開始只露「誰付的」

#### 健康紀錄
- 疫苗、體重、用藥、看診紀錄
- 每隻狗各自一份歷史
- 提醒功能（疫苗到期、定期體重）

### 改進

#### 配對 / 滑卡
- Schema 維持 dog-to-dog（不大改）
- UI 層：同一主人多隻狗合併成「一張大卡片」顯示
- 新增 `user_matches` 表聚合 user-level 配對，**避免聊天室爆量**（小明 2 隻 ↔ 小華 2 隻不會產生 4 個聊天室）
- `messages` 改掛在 `user_match_id` 而非 `match_id`

#### 地圖升級
- 從靜態散步點地圖 → 「附近狗友」探索頁
- 顯示附近誰最近在這帶遛狗、誰現在出門了（presence）
- 點頭像看檔案 → 直接私訊

---

## 四、設計原則：保留開發彈性

照「不寫死任何一項」的原則：

- 枚舉類資料（gender / size / 類別 / 健康紀錄類型）改成 lookup table，新增類別不用 migration
- 多對多關係從 day 1 就用 join table（即使初期都是一筆）：`expense_pets`、`expense_contributors`
- 外部服務（OCR、推播、地圖）抽象成 interface，可切換實作
- JSONB metadata 欄位給未確定屬性留空間（receipt 解析結果、health record 細節）
- **不過度抽象**：UI 與業務邏輯維持簡單，只在「資料模型」與「外部依賴」這兩層保留彈性

---

## 五、Schema 改動 / Migration 順序

| # | 內容 | 風險 | 狀態 |
|---|---|---|---|
| 008 | Lookup tables：`dog_genders`, `dog_sizes`, `expense_categories`, `health_record_types`；`dogs.gender` / `dogs.size` 從 CHECK 改 FK | 低 | 待動工 |
| 009 | `user_matches` 表 + `messages.user_match_id` 遷移；trigger 自動派生 user-level match | 中（要改 RLS + app code） | 待 |
| 010 | 記帳三張表：`dog_expenses` / `expense_pets` / `expense_contributors` | 低 | 待 |
| 011 | `health_records` 表 + 提醒邏輯 | 低 | 待 |
| 012（之後） | Drop walk_groups 系列（等 UI 完全切換） | 低 | 等 |

### 不做的事
- **`pet_owners` 多主人 join table**：使用者明確表示「一狗一主就夠」，跳過。需要時未來再加。
- **配對 schema 大改（dog→user）**：保留現有 dog-to-dog 結構，靠 `user_matches` 聚合解決問題。

---

## 六、動工順序總覽

1. **Phase 1 — Schema**：Migration 008 → 009 → 010 → 011（依序，每個獨立可測）
2. **Phase 2 — UI 收斂**：6 tab → 4 tab、map + walks 整合進探索頁、狗狗分頁加健康/記帳
3. **Phase 3 — 清理**：等 walk_groups UI 全移除後，動 Migration 012

---

## 七、決策紀錄（避免之後忘記為什麼這樣做）

| 決策 | 為什麼 |
|---|---|
| 拿掉揪團 | 「僅好友可見」設計讓新人看到空 App，跟「想認識人」目標衝突；私訊就夠用 |
| 滑卡用合併卡片而非改 schema | 改 swipes/matches 結構成本高，UI 層處理夠用 |
| 加 `user_matches` 聚合層 | 避免一人多狗造成聊天室爆量 |
| 記帳走多狗 + 多人 schema 但 UI 簡化 | 上架後加複雜模式不用 migration |
| 不做 pet_owners | 使用者目前只需一狗一主，YAGNI |
| 發票先做電子發票 QR | 台灣使用者體感好、免費、離線、100% 準確 |

---

## 八、暫停點 (2026-04-26)

開發暫停以投入新專案。對應 git tag：`v0.1-pause-2026-04-26`。

### 已完成
- ✅ Phase 1 全部 schema migrations（008-011）已上 production Supabase
- ✅ Phase 2.1：4-tab 結構（探索 / 聊天 / 狗狗 / 我）
- ✅ Phase 2.2：探索頁整合（segmented control 滑卡/附近）+ 喜歡你列表 + 探索 header 紅心 badge
- ✅ Phase 2.3：記帳功能（backend + UI + 已驗證可新增/刪除）
- ✅ Phase 2.4：健康追蹤（backend + UI + migration 012 移除驅蟲加其他）
- ✅ 跨平台確認對話框 `lib/confirm.ts`、刪除按鈕

### 暫停時待做
- ⏸️ Phase 2.5：通知中心（聚合健康提醒到期 + likes-you pending，加 🔔 badge 在 tab header）
- ⏸️ Phase 2.6：移除揪團 UI（DB 表保留）
- ⏸️ Phase 3：推播通知（需 Apple Developer $99 + expo-notifications）

### 暫停期間平台狀態
- **GitHub**：永久保存
- **Supabase 免費**：⚠️ **7 天無 API 請求會自動暫停**；資料已 dump 到 `backups/` 作為保險。90 天無使用可能被刪
- **Render 免費**：15 分鐘 idle 進入 sleep；90 天無 deploy 可能被刪。code 在 git，重新 connect 即可
- **Apple Developer**：未付費

### 回來時的復活流程

```bash
# 1. 拉最新 code（其實 push 之後沒人改，這步只是 sanity check）
cd /Users/kidd/Projects/pawmate
git pull

# 2. 看 Supabase 狀態：dashboard.supabase.com → 如果 paused，按 restore
# 3. 看 Render：dashboard.render.com → 如果 service 不見，從 GitHub 重新 connect

# 4. 復原本地 dev
npm install
npx expo start
# 按 s 切到 Expo Go 模式 → 按 w 開瀏覽器（或按 i 開 Simulator 如果 Xcode 已裝完）

# 5. 如果 Supabase 整個 project 被刪，要從 backup 還原：
#    新建 supabase project → supabase link → supabase db push（跑所有 migration）
#    → 把 backups/pawmate-2026-04-26.sql 的 data 部分 import
```

### 暫停前要記得（給未來的我）
- `.env` 內容已存到密碼管理器（手動，不在 git 裡）
- `backups/pawmate-2026-04-26.sql` 是 schema + data 的完整 dump
- Memory 還在 `~/.claude/projects/-Users-kidd-Projects-pawmate/memory/`，新對話會自動載入
- 詳細 user 偏好和決策見 memory：`feedback_keep_flexibility.md`、`project_pawmate_overview.md`
