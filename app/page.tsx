import fs from "node:fs";
import path from "node:path";
import SiteScripts from "./SiteScripts";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultContentMap, derivePhoneTelHref } from "@/lib/site-content";
import { PHOTO_SLOTS, PHOTO_BUCKET } from "@/lib/photo-slots";

// FAQ／文案內容／照片改成從 Supabase 讀取，每 60 秒重新驗證一次（ISR），
// 後台編輯後最慢約 1 分鐘會反映到正式網站。
export const revalidate = 60;

type FaqItem = {
  question: string;
  answer: string;
};

// 資料庫查詢失敗或目前是空的時候使用的預設內容，確保網站永遠不會開天窗。
const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "我完全沒有開羽球館／匹克球館的經驗，可以嗎？",
    answer:
      "可以。我們會先了解你的預算、地區與坪數，提供系統配置與初步營運規劃建議；場地法規、消防等專業事項則會提醒你向主管機關或合格專業人員確認。",
  },
  {
    question: "需要每天到店嗎？",
    answer:
      "系統支援 24H 自助營運，不需要隨時有人在現場；但定期清潔、盤點與巡場仍建議安排人力處理。",
  },
  {
    question: "晚上系統或設備出問題怎麼辦？",
    answer:
      "月度服務費已包含線上客服與 LINE 異常通知功能，系統異常會即時通知，並提供遠端排除或到府支援。",
  },
  {
    question: "場地淨空高度不夠怎麼辦？",
    answer:
      "羽球對淨空高度較敏感，若現場樑柱、風管等障礙物較多，建議在簽約前實際測量並評估是否影響擊球動作，必要時可考慮調整場地配置或改以匹克球等其他規劃。",
  },
  {
    question: "羽球館可以同時做匹克球嗎？兩種場地能共用系統嗎？",
    answer:
      "可以。同一套後台管理系統與會員預約網站可同時管理羽球場與匹克球場，方便混合店型統一營運與收款。",
  },
  {
    question: "兩種系統方案（桌上型／落地型）怎麼選？",
    answer:
      "若客群以線上預約先付款為主、場地片數不多，桌上型控制方案較輕量；若現場臨櫃客較多、需要收現金、想做到完全無人化，建議選擇落地型自助結帳方案。",
  },
  {
    question: "多久可以開店？",
    answer:
      "依場地現況、裝修範圍與法規申請進度而定，若為既有合法場地僅需安裝系統，時程會比全新裝修快上許多。",
  },
  {
    question: "已有羽球館／匹克球場地，可以直接改自助嗎？",
    answer:
      "可以，多數既有場地只需加裝門禁、電控與自助結帳設備，不需要大幅拆除重建，實際狀況建議現場勘查後確認。",
  },
  {
    question: "每個月有哪些固定費用？",
    answer:
      "主要包含系統服務費、場地租金、水電、清潔與行銷等，系統服務費已含 OTP 簡訊、線上客服、雲端維護與遠端更新。",
  },
  {
    question: "門禁怎麼規劃？",
    answer:
      "可依店型規劃大門與各場地的門禁方式，例如整館單一入口、或每片場地獨立控制，實際規劃會依現場動線與消防逃生需求調整。",
  },
  {
    question: "D-1 是什麼？跟消防法規是同一件事嗎？",
    answer:
      "D-1 是「建築物使用類組及變更使用辦法」裡的分類，羽球館、匹克球館這類室內球類運動場、健身房都屬於 D 類（休閒、文教類）之 D-1 組，用來判斷建物用途是否合法對應、需不需要變更使用執照。消防法規則是另一套系統——「各類場所消防安全設備設置標準」用甲、乙、丙、丁、戊類，運動休閒場館常被歸在乙類（體育館、活動中心）或甲類（健身休閒中心），會影響要裝哪些消防安全設備。兩者判斷邏輯不同，實際歸類都須以主管機關認定為準。",
  },
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFaqItemsHtml(faqs: FaqItem[]): string {
  return faqs
    .map(
      (f) =>
        `<div class="faq-item"><button class="faq-q">${escapeHtml(
          f.question
        )}<span class="plus"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></button><div class="faq-a"><p>${escapeHtml(
          f.answer
        )}</p></div></div>`
    )
    .join("");
}

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("badminton_faqs")
      .select("question, answer")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) {
      return DEFAULT_FAQS;
    }
    return data as FaqItem[];
  } catch {
    return DEFAULT_FAQS;
  }
}

async function getSiteContent(): Promise<Record<string, string>> {
  const map = getDefaultContentMap();
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("badminton_site_content")
      .select("key, value");
    if (!error && data) {
      for (const row of data as { key: string; value: string }[]) {
        map[row.key] = row.value;
      }
    }
  } catch {
    // 讀取失敗就用預設值，不影響網站上線
  }
  // tel: 連結用的純數字電話號碼，是從 contact_phone 自動算出來的，
  // 不是後台可以直接編輯的欄位。
  map["contact_phone_tel"] = derivePhoneTelHref(map);
  return map;
}

function applyContentMarkers(html: string, content: Record<string, string>): string {
  return html.replace(/<!--CONTENT:([a-zA-Z0-9_]+)-->/g, (_match, key: string) => {
    const value = content[key];
    return value !== undefined ? escapeHtml(value) : "";
  });
}

async function getPhotoUrls(): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("badminton_photos")
      .select("slot_key, storage_path, updated_at");
    if (!error && data) {
      for (const row of data as { slot_key: string; storage_path: string; updated_at: string }[]) {
        const { data: pub } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(row.storage_path);
        const version = encodeURIComponent(row.updated_at ?? "");
        urls[row.slot_key] = `${pub.publicUrl}?v=${version}`;
      }
    }
  } catch {
    // 讀取失敗就維持原本佔位畫面，不影響網站上線
  }
  return urls;
}

function applyPhotoMarkers(html: string, photoUrls: Record<string, string>): string {
  return html.replace(/<!--PHOTO:([a-zA-Z0-9_]+)-->/g, (_match, key: string) => {
    const slot = PHOTO_SLOTS.find((s) => s.key === key);
    const url = photoUrls[key];
    if (url) {
      return `<img src="${escapeHtml(url)}" alt="${
        slot ? escapeHtml(slot.label) : ""
      }" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />`;
    }
    return slot ? slot.placeholderHtml : "";
  });
}

export default async function Page() {
  const bodyHtmlRaw = fs.readFileSync(
    path.join(process.cwd(), "content", "body.html"),
    "utf8"
  );
  const siteScript = fs.readFileSync(
    path.join(process.cwd(), "content", "site.js"),
    "utf8"
  );

  const [faqs, content, photoUrls] = await Promise.all([
    getFaqs(),
    getSiteContent(),
    getPhotoUrls(),
  ]);

  let bodyHtml = bodyHtmlRaw.replace("<!--FAQ_ITEMS-->", renderFaqItemsHtml(faqs));
  bodyHtml = applyContentMarkers(bodyHtml, content);
  bodyHtml = applyPhotoMarkers(bodyHtml, photoUrls);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <SiteScripts code={siteScript} />
    </>
  );
}
