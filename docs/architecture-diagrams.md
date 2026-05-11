---
# Internal diagrams doc — excluded from GitHub Pages by docs/_config.yml
# 用 mermaid 畫的視覺化架構圖。在 GitHub 上會自動 render。
# 文字版完整文件請看 docs/architecture.md
---

# DogBond 視覺化架構圖

> 這份用 mermaid 語法繪圖，**在 GitHub 上瀏覽**會自動 render 成圖片。
> VS Code 也可以裝 [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) 套件來預覽。
> 文字版說明請看 [architecture.md](architecture.md)。

---

## 1. 系統總覽

```mermaid
graph TB
    subgraph Client["📱 Client (DogBond App)"]
        Android["Android<br/>com.kidd91.dogbond"]
        iOS["iOS<br/>(未上架)"]
        Web["Web<br/>(測試 / 截圖用)"]
    end

    subgraph Backend["☁️ Backend Services"]
        Express["Express API<br/>(Render Free)"]
    end

    subgraph DB["🗄️ Supabase (Free Tier)"]
        Auth["Auth<br/>(JWT + RLS)"]
        Postgres["Postgres<br/>+ PostGIS"]
        Storage["Storage<br/>(狗狗照片)"]
    end

    subgraph External["🌐 External"]
        Google["Google<br/>OAuth 2.0"]
        Brevo["Brevo SMTP<br/>(已停用)"]
    end

    Client -->|"anon key + RLS"| Auth
    Client -->|"anon key + RLS"| Postgres
    Client -->|"public read"| Storage
    Client -->|"上傳 / Admin 操作"| Express
    Client -.->|"OAuth flow"| Google

    Express -->|"service_role key"| Postgres
    Express -->|"upload"| Storage

    Google -.->|"callback"| Auth

    style Client fill:#FFE8D6,stroke:#FF8C69
    style Backend fill:#E0F4FF,stroke:#2196F3
    style DB fill:#E8F5E9,stroke:#4CAF50
    style External fill:#F3E5F5,stroke:#9C27B0
```

**重點**：
- Client 大部分**直連 Supabase**（用 anon key + RLS）
- 只有 admin 操作（刪帳號、檔案上傳）走 Express
- Google OAuth 走外部瀏覽器，最後 callback 到 Supabase

---

## 2. 資料流（讀取狗狗清單）

```mermaid
graph LR
    User["👤 使用者"] -->|"打開 App"| Client["Client"]
    Client -->|"1. 取得 session"| AsyncStorage["💾 AsyncStorage"]
    Client -->|"2. 帶 JWT 查詢"| Supabase["Supabase"]
    Supabase -->|"3. RLS 檢查 owner_id"| RLS["🔒 RLS Policy"]
    RLS -->|"4. 通過"| Result["📋 dogs[]"]
    Result -->|"5. zustand 更新"| Store["📦 dogsStore"]
    Store -->|"6. re-render"| UI["🎨 UI"]
```

---

## 3. 認證流程

### 3.1 Email + Password 註冊

```mermaid
sequenceDiagram
    autonumber
    actor User as 使用者
    participant Client as Client App
    participant Supabase as Supabase Auth
    participant DB as Postgres
    participant Trigger as handle_new_user<br/>trigger
    participant SMTP as Supabase SMTP

    User->>Client: 填 email + password + 名字
    Client->>Supabase: signUp({ email, password,<br/>options: { data: { display_name } } })
    Supabase->>DB: INSERT auth.users
    DB->>Trigger: AFTER INSERT 觸發
    Trigger->>DB: INSERT profiles<br/>(id, display_name)
    Note over Trigger: display_name 優先順序：<br/>1. metadata.display_name<br/>2. metadata.full_name<br/>3. metadata.name<br/>4. split_part(email,'@',1)
    Supabase->>SMTP: 寄驗證信
    Note over SMTP: ⚠️ 預設 SMTP<br/>4 封/小時上限
    SMTP-->>User: 📧 驗證連結
    User->>Supabase: 點擊驗證連結
    Supabase->>Client: 啟動 session
```

### 3.2 Google OAuth 登入

```mermaid
sequenceDiagram
    autonumber
    actor User as 使用者
    participant Client as Client App
    participant Browser as expo-web-browser
    participant Google as Google OAuth
    participant Supabase as Supabase Auth
    participant Trigger as handle_new_user<br/>trigger

    User->>Client: 點「用 Google 登入」
    Client->>Browser: signInWithOAuth({ provider: 'google' })
    Browser->>Google: 開啟同意畫面
    Google-->>User: 選擇帳號 + 同意授權
    User->>Google: 同意
    Google->>Supabase: redirect 到<br/>supabase.co/auth/v1/callback
    alt 第一次登入
        Supabase->>Trigger: 建立 auth.users<br/>+ trigger 自動建 profile
    else 已有帳號 (相同 email)
        Supabase->>Supabase: 自動合併到既有 user
    end
    Supabase-->>Browser: deep link<br/>dogbond://...#access_token=
    Browser->>Client: 回到 App
    Client->>Client: AsyncStorage 持久化 session
```

### 3.3 帳號刪除（Google Play 2024 政策必要）

```mermaid
sequenceDiagram
    autonumber
    actor User as 使用者
    participant Client as Client App
    participant Express as Express API
    participant Admin as supabaseAdmin<br/>(service_role)
    participant DB as Postgres

    User->>Client: 「我」→「刪除帳號」
    Client->>User: ⚠️ 二段確認
    User->>Client: 確認刪除
    Client->>Express: DELETE /api/auth/me<br/>(Bearer JWT)
    Express->>Express: authMiddleware<br/>解出 req.userId
    Express->>Admin: deleteUser(userId)
    Admin->>DB: DELETE FROM auth.users WHERE id=?
    Note over DB: ON DELETE CASCADE 鏈：<br/>auth.users → profiles<br/>→ dogs → swipes/matches/messages<br/>→ expenses / health_*
    DB-->>Admin: ✅ 全部清光
    Admin-->>Express: success
    Express-->>Client: 200 OK
    Client->>Client: 清 zustand state<br/>+ 跳回 login
```

---

## 4. 資料庫 ER 圖

```mermaid
erDiagram
    USERS ||--|| PROFILES : "trigger 自動建"
    PROFILES ||--o{ DOGS : "擁有"
    DOGS ||--o{ SWIPES : "swiper"
    DOGS ||--o{ SWIPES : "target"
    DOGS ||--o{ MATCHES : "dog_a"
    DOGS ||--o{ MATCHES : "dog_b"
    MATCHES ||--o{ MESSAGES : "包含"
    DOGS ||--o{ EXPENSES : "記帳"
    DOGS ||--o{ HEALTH_RECORDS : "健康紀錄"
    DOGS ||--o{ HEALTH_REMINDERS : "提醒"

    USERS {
        uuid id PK
        text email
        jsonb raw_user_meta_data
    }
    PROFILES {
        uuid id PK_FK
        text display_name
        text city
        text district
        geography location "PostGIS Point"
    }
    DOGS {
        uuid id PK
        uuid owner_id FK
        text name
        text breed
        int age_months
        text gender
        text size
        text bio
        text[] personality
        text[] photos
    }
    SWIPES {
        uuid id PK
        uuid swiper_dog_id FK
        uuid target_dog_id FK
        text action "like or pass"
        timestamptz created_at
    }
    MATCHES {
        uuid id PK
        uuid dog_a_id FK
        uuid dog_b_id FK
        timestamptz matched_at
    }
    MESSAGES {
        uuid id PK
        uuid match_id FK
        uuid sender_id FK
        text content
        timestamptz sent_at
    }
    EXPENSES {
        uuid id PK
        uuid dog_id FK
        text category
        numeric amount
        date date
    }
    HEALTH_RECORDS {
        uuid id PK
        uuid dog_id FK
        text type
        text title
        date date
    }
    HEALTH_REMINDERS {
        uuid id PK
        uuid dog_id FK
        text type
        text title
        date due_date
        timestamptz dismissed_at "NULL=未關閉"
    }
```

**重點**：
- 全部 ON DELETE CASCADE — 刪 USERS 會把所有資料連動清光
- PROFILES 是 1:1 對 USERS，靠 trigger 自動建立

---

## 5. 滑卡配對 → 聊天 全流程

```mermaid
sequenceDiagram
    autonumber
    actor A as 飼主 A<br/>(狗 a1)
    actor B as 飼主 B<br/>(狗 b1)
    participant ClientA as Client A
    participant ClientB as Client B
    participant DB as Supabase

    Note over A,B: 階段 1: 滑卡
    A->>ClientA: 看到狗 b1，右滑
    ClientA->>DB: INSERT swipes<br/>(swiper=a1, target=b1, action=like)
    DB->>DB: 檢查反向：b1 是否曾 like a1？
    Note over DB: 還沒 → 不配對

    Note over A,B: ⏰ 過了一段時間...

    B->>ClientB: 看到狗 a1，右滑
    ClientB->>DB: INSERT swipes<br/>(swiper=b1, target=a1, action=like)
    DB->>DB: 檢查反向：a1 已 like b1 ✅
    DB->>DB: INSERT matches(dog_a=a1, dog_b=b1)

    Note over A,B: 階段 2: 雙方都被通知配對成功
    DB-->>ClientA: realtime: new match
    DB-->>ClientB: realtime: new match
    ClientA-->>A: 🎉 配對通知
    ClientB-->>B: 🎉 配對通知

    Note over A,B: 階段 3: 開聊
    A->>ClientA: 開啟配對 → 打字「Hi！」
    ClientA->>DB: INSERT messages(match_id, sender=A, content)
    DB-->>ClientB: realtime: new message
    ClientB-->>B: 💬 通知
```

---

## 6. 部署架構

```mermaid
graph TB
    subgraph Dev["💻 開發環境"]
        Local["本地<br/>(npx expo start)"]
        VSCode["VS Code"]
    end

    subgraph Source["📚 Source Control"]
        GitHub["GitHub<br/>kidd-91/pawmate"]
    end

    subgraph CI["⚙️ Build / Deploy"]
        EAS["EAS Build<br/>(Expo Cloud)"]
        Render["Render<br/>(Auto-deploy)"]
        Pages["GitHub Pages<br/>(Jekyll)"]
    end

    subgraph Prod["🚀 Production"]
        PlayStore["Google Play Store<br/>com.kidd91.dogbond"]
        RenderApp["dogbond-api<br/>.onrender.com"]
        SiteApp["kidd-91.github.io<br/>/pawmate/"]
    end

    subgraph Services["🔧 Backing Services"]
        SupabaseProd["Supabase<br/>(Free Tier)"]
        GoogleCloud["Google Cloud<br/>OAuth"]
    end

    VSCode -->|"git push"| GitHub
    Local -.->|"測試"| SupabaseProd

    GitHub -->|"main branch"| Render
    GitHub -->|"docs/"| Pages
    GitHub -.->|"手動 build"| EAS

    EAS -->|".aab 檔"| PlayStore
    Render --> RenderApp
    Pages --> SiteApp

    PlayStore -.->|"使用者下載"| Users["📱 使用者手機"]
    Users --> RenderApp
    Users --> SupabaseProd
    Users -.->|"OAuth"| GoogleCloud

    style Dev fill:#FFF3E0,stroke:#FF9800
    style Source fill:#F3E5F5,stroke:#9C27B0
    style CI fill:#E0F4FF,stroke:#2196F3
    style Prod fill:#E8F5E9,stroke:#4CAF50
    style Services fill:#FFEBEE,stroke:#F44336
```

---

## 7. 通知中心聚合邏輯

```mermaid
graph LR
    subgraph Sources["資料來源"]
        Likes["你被誰 like<br/>(swipes WHERE target=mine)"]
        Reminders["健康提醒到期<br/>(health_reminders<br/>WHERE due_date<=今天<br/>AND dismissed_at IS NULL)"]
    end

    subgraph Aggregation["聚合"]
        Store["notificationsStore"]
    end

    subgraph UI["🔔 通知中心"]
        Bell["鈴鐺圖示<br/>(Tab Bar)"]
        Badge["紅點數字"]
        List["通知列表"]
    end

    Likes -->|"useEffect 訂閱"| Store
    Reminders -->|"useEffect 訂閱"| Store
    Store -->|"unread count"| Badge
    Store --> Bell
    Store --> List

    List -->|"X 按鈕"| Dismiss["UPDATE health_reminders<br/>SET dismissed_at=NOW()"]
    Dismiss -.->|"refresh"| Store
```

---

## 8. 上架流程（Mermaid Gantt）

```mermaid
gantt
    title DogBond 上架時程（2026-05）
    dateFormat YYYY-MM-DD
    axisFormat %m/%d

    section 已完成
    改名 DogBond           :done, a1, 2026-04-30, 1d
    Google OAuth 整合       :done, a2, 2026-05-04, 3d
    隱私權 + 服務條款       :done, a3, 2026-05-05, 2d
    帳號刪除功能            :done, a4, 2026-05-06, 1d
    App icons 替換          :done, a5, 2026-05-06, 1d
    Play Store 截圖 + 文案  :done, a6, 2026-05-07, 2d
    Play Console 註冊       :done, a7, 2026-05-11, 1d

    section 進行中
    身分驗證審核            :active, b1, 2026-05-11, 3d

    section 待辦
    Android 裝置驗證        :c1, 2026-05-11, 1d
    電話驗證                :c2, after b1, 1d
    EAS production build    :c3, after b1, 1d
    Play Console 上架送審    :c4, after c3, 3d
    Google OAuth 驗證       :c5, 2026-05-11, 14d
```

---

## 9. 容量規劃（單一頁面圖）

```mermaid
graph TD
    Start["DogBond Free Tier"] --> Users{"使用者數量"}

    Users -->|"< 200 active/月"| Free["✅ Free Tier 夠用<br/>$0/月"]
    Users -->|"200-1000"| Mid["⚠️ 升 Supabase Pro<br/>$25/月"]
    Users -->|"> 1000"| Scale["🚨 升 Pro + Render Starter<br/>$32/月"]

    Free --> FreeBottle["主要瓶頸：<br/>Supabase 5GB egress<br/>(狗狗照片)"]
    Mid --> MidBottle["主要瓶頸：<br/>Render free cold start<br/>(可升 $7/月解)"]
    Scale --> ScaleBottle["主要瓶頸：<br/>Express 單實例 RAM<br/>(要 horizontal scale)"]

    style Free fill:#C8E6C9
    style Mid fill:#FFE0B2
    style Scale fill:#FFCDD2
```

---

## 怎麼看這份文件

### 在 GitHub 上看（最佳）
https://github.com/kidd-91/pawmate/blob/main/docs/architecture-diagrams.md
→ 所有 mermaid 圖會自動 render 成漂亮的圖

### 在 VS Code 看
1. 安裝套件：[Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
2. 打開這個檔案 → `Cmd+Shift+V` 開啟 preview

### 在其他工具看
- [Mermaid Live Editor](https://mermaid.live/) — 把 ` ```mermaid ` 區塊裡的內容貼進去看
- [Notion](https://notion.so) — 也支援 mermaid code block

---

*文字版完整文件：[architecture.md](architecture.md)*
*最後更新：2026-05-11*
