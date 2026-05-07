---
# Internal doc — excluded from GitHub Pages by docs/_config.yml
# Place all Play Store商店頁文案於此，方便提交與修訂。
---

# Google Play Store 商店頁文案

> 提交時直接 copy 貼到 Play Console 的「Main store listing」。
> 字數限制：App 名稱 30 / 簡短說明 80 / 完整說明 4000。

---

## App 名稱（max 30 字元）

```
DogBond
```

---

## 簡短說明 / Short description（max 80 字元）

```
為養狗的人打造的社交 App — 認識附近狗友、追蹤毛孩健康與開銷
```

---

## 完整說明 / Full description（max 4000 字元）

```
🐾 DogBond — 為養狗的人打造的社交 App

養狗的你，想找有共同話題的朋友嗎？想記錄毛孩的健康，但翻爛了行事曆還是會漏掉疫苗？想知道每月在狗狗身上花了多少？

DogBond 把這些事整理在一個 App 裡，讓你和你的毛孩一起認識新朋友、過得更健康。

✨ 主要功能

💕 滑卡配對
為你的狗狗建立檔案，照片、品種、個性、散步偏好一次填好。喜歡哪隻狗就右滑，雙方都喜歡就配對成功。

📍 附近狗友
打開地圖看看你家附近有哪些狗友，依距離排序，找到能一起散步的鄰居。

💬 私訊聊天
配對後直接開聊，約散步、交換養狗心得，不需要外加任何 App。

🏥 健康追蹤
疫苗、用藥、體重、看診、美容紀錄都能存。設定下次到期日，App 自動提醒。

💰 開銷記帳
分類記錄毛孩開銷（飼料、看診、美容、玩具⋯），月底一目瞭然花了多少在誰身上。

🔔 通知中心
喜歡你的人、健康提醒到期，全部聚在一個鈴鐺裡，不會錯過任何重要事。

🎯 為什麼選 DogBond？

✓ 不只是配對 — 配對 + 健康 + 記帳，一個 App 解決養狗日常
✓ 主打台灣 — 介面在地化,距離和地圖以台灣為主
✓ 用 Google 一鍵登入 — 不用再記一組密碼

🔒 隱私與安全

我們重視你的隱私。你的資料儲存在 Supabase，傳輸全程加密。詳細的隱私權政策與服務條款都公開在我們的網站上：
• 隱私權政策：https://kidd-91.github.io/pawmate/legal/privacy/
• 服務條款：https://kidd-91.github.io/pawmate/legal/terms/

你可以隨時在「我」分頁底部刪除帳號與所有資料。

📧 聯絡我們

DogBond 是個獨立開發者的小作品，有任何回饋、bug、或想看到的功能，都歡迎寫信來：

Email：kidd91.chen@gmail.com

🐶 一起讓你的狗狗多一些朋友吧。
```

---

## 其他 Play Console 欄位提示

### App category
- **App category**：Social（主分類）
- **Tags**：Pets、Dating、Lifestyle 中挑 2-3 個

### Contact details
- **Email**: kidd91.chen@gmail.com
- **Phone**: 留空（個人開發者可選）
- **Website**: https://kidd-91.github.io/pawmate/

### Privacy Policy URL
```
https://kidd-91.github.io/pawmate/legal/privacy/
```

### Target audience and content
- **Target age groups**: 13-15、16-17、18+ 都勾（13+）
- **Appeals to children**: 否
- **Ads**: 否（目前沒有廣告）

### Data safety section
資料收集類型（要在 Play Console「Data safety」表格逐一勾選）：
- Personal info: Name, Email address
- Photos: Photos uploaded to dog profiles
- Location: Approximate location（for nearby search, only when in app）
- Messages: Chat messages between matched users
- App activity: Likes, matches, dog profile interactions

加密：是（HTTPS 傳輸）
資料可刪除：是（in-app + email request）
是否分享給第三方：否

---

## 改版檢查清單

修改 App 後上傳新版本前確認：
- [ ] 新功能是否需更新「完整說明」？
- [ ] 隱私政策是否需更新（新類型資料 / 新第三方服務）？
- [ ] App 版本號 (`app.json` `version`) 已 bump？
- [ ] Android `versionCode` 已遞增（EAS build 通常自動處理）？
