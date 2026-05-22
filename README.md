# MARCHENOU — GID ADMINISTRASE (KIJAN POU W KONEKTE GOOGLE SHEETS) 🇭🇹

Gid sa a fèt espesyalman pou ou menm ki pa gen okenn eksperyans nan kòd oswa baz done. Grasa sistèm sa a, ou ka jere pwen kliyan yo depi sou telefòn ou san w pa peye 1 santim ($0)!

---

## 🟢 OPSYON 1: SÈVI AK GOOGLE SHEETS (Rekòmande — Pifò Fasil ak Otomatik)

Olye pou w chanje kòd la chak fwa w vle bay yon moun pwen, ou ka modifye yon senp tablo Excel sou Google Sheets nan telefòn ou, epi sit la ap mete solde a ajou kounye a!

### 1️⃣ Kreye Tablo a sou Google Drive
1. Ale sou [Google Sheets](https://sheets.google.com/) epi kreye yon nouvo fèy (Fichye vid).
2. Nan premye liy lan (Row 1), mete **tit kolòn sa yo sèlman, ekri an miniskil**:
   * Kolòn A: `pseudo`
   * Kolòn B: `phone`
   * Kolòn C: `points`
   * Kolòn D: `total_earned`
   * Kolòn E: `total_spent`
3. Kòmanse mete non ak pwen moun yo nan liy ki anba yo. 
   * *Nòt: Nimewo telefòn lan pa dwe gen espas oswa siy (+) pou rechèch la ka fèt pi vit.*

**Egzanp Tablo:**
| pseudo | phone | points | total_earned | total_spent |
| :--- | :--- | :--- | :--- | :--- |
| Milio | 50956005344 | 120 | 150 | 30 |
| Sephora | 50940761237 | 350 | 400 | 50 |

---

### 2️⃣ Pibliye Google Sheet la nan fòma CSV (Pou sit la ka li l)
Pou pèmèt sit **MARCHENOU** a li enfòmasyon yo otomatikman:
1. Nan meni an klike sou **Fichier** (File) > **Partager** (Share) > **Publier sur le web** (Publish to the web).
2. Nan bwat k ap parèt la, klike sou opsyon "Page web" (Web page) a epi chanje l pou l vin: **Valeurs séparées par des virgules (.csv)** (Comma-separated values).
3. Klike sou bouton ble **Publier** la epi konfime avèk "Ok".
4. Kopi tout gwo lyen entènèt (URL) Google ba ou a.

---

### 3️⃣ Konekte l ak sit la depi nan Navigatè w la
1. Louvri sit MARCHENOU w lan (sou Netlify oswa nan preview).
2. Klike nan meni an sou **Pwen m** pou w ale nan Portefeuille la.
3. Scroll desann epi klike sou bouton: **⚙️ Alajisteman Admin (Konekte Google Sheets)**.
4. Kole gwo lyen CSV ou te kopi a nan espas la, epi klike sou **Sove Lyen**.
5. Kounye a, rechèch pwen an ap rale enfòmasyon yo an dirèk depi nan tablo ou! Nenpòt chanjman ou fè nan Google Sheets ap parèt otomatikman sou sit la.

---

## 🟡 OPSYON 2: SÈVI AK FICHIER `points.json` (Lokal)

Si ou pa vle sèvi ak Google Sheets, ou ka chanje solde yo nan fichiye `points.json` ki nan katab pwojè w la:
1. Louvri fichiye `points.json` la.
2. Edit valè non moun, telefòn yo oswa kantite pwen yo.
3. Sove l epi redeplwaye dosye a (glisser-déposer) sou Netlify. Sit la gen yon sistèm sekirite k ap li fichiye sa otomatikman si Google Sheets pa konekte.

---

## 💬 PROSESIS VALIDASYON AK KLIYAN YO (WhatsApp)

Men ki jan pou w travay ak kliyan yo an pratik ak sistèm pwen sa a:

1. **Prèv Kliyan**: Kliyan an voye yon prèv sou WhatsApp ou ak yon capture d'écran pou l montre li fè yon aksyon (vòt, rekrite yon moun, peye abònman depase, elatriye).
2. **Tablo Admin**: Ou menm kòm Admin, ou verifye prèv la. Si li kòrèk, ou pran telefòn ou, ou louvri Google Sheets epi ou moute pwen moun nan daprè [BARÈME/TARI PWEN](./index.html#bareme) la.
3. **Konfimasyon**: Ou reponn kliyan an sou WhatsApp "Pwen ou yo moute!" epi kliyan an ka ale kounye a sou sit MARCHENOU an, mete non l oswa nimewo WhatsApp li pou l wè nouvo tikè pwen li parèt byen bèl ak rabè li merite!

---

💡 *Se yon sistèm 100% gratis, san database sofistike, fasil pou jere, epi ki pa bezwen okenn kòd k ap kouri sou background pou w pa gen depans sèvè!*
