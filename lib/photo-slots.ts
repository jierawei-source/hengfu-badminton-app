// 首頁可以在後台上傳照片的欄位。slot.key 對應 content/body.html 裡的
// <!--PHOTO:xxx--> 標記，以及 badminton_photos 表的 slot_key。
//
// placeholderHtml 是還沒上傳照片時顯示的原始佔位畫面（跟 body.html 原本
// 寫死的內容一模一樣），確保沒有照片時網站畫面跟現在完全一樣，不會開天窗。

export type PhotoSlot = {
  key: string;
  label: string;
  placeholderHtml: string;
};

const HERO_PLACEHOLDER = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.8" stroke="currentColor" stroke-width="1.6"/><path d="M3 16l5-4 4 3 3-2.5L21 16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <b>預留球館實景照片</b>
          <span>可於後台上傳，建議比例 4:3</span>`;

const PLAN_PLACEHOLDER = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.8" stroke="currentColor" stroke-width="1.6"/><path d="M3 16l5-4 4 3 3-2.5L21 16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <b>預留產品圖片</b>
          <span>可於後台上傳，建議比例 4:3</span>`;

const GOLF_PLACEHOLDER = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="1.8" stroke="currentColor" stroke-width="1.6"/><path d="M3 16l5-4 4 3 3-2.5L21 16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>
          <b>預留高爾夫模擬器實景照片</b>
          <span>可於後台上傳，建議比例 21:9（寬幅橫圖）</span>`;

export const PHOTO_BUCKET = "badminton-photos";

export const PHOTO_SLOTS: PhotoSlot[] = [
  { key: "hero", label: "球館實景照片（首頁最上方）", placeholderHtml: HERO_PLACEHOLDER },
  { key: "plan_desktop", label: "桌上型控制方案・產品圖片", placeholderHtml: PLAN_PLACEHOLDER },
  { key: "plan_floor", label: "落地型自助結帳方案・產品圖片", placeholderHtml: PLAN_PLACEHOLDER },
  { key: "golf_room", label: "室內高爾夫模擬器實景照片（高爾夫小節）", placeholderHtml: GOLF_PLACEHOLDER },
];
