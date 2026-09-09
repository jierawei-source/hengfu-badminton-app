// 首頁上可以在後台編輯的文字內容。key 對應 content/body.html 裡的
// <!--CONTENT:xxx--> 標記；每個 key 都要有一個預設值，這樣資料庫讀取
// 失敗或該筆資料還沒建立時，網站也不會開天窗。
//
// 之後要讓更多文字變成可編輯，就在這裡加一筆 { key, label, defaultValue, group }，
// 再到 content/body.html 對應位置插入 <!--CONTENT:新key--> 標記即可，
// 不需要改動 app/admin/(protected)/content 或 API route。

export type ContentField = {
  key: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
  group: string;
};

export const CONTENT_FIELDS: ContentField[] = [
  // 方案費用
  {
    key: "plan_desktop_price",
    label: "桌上型控制方案・建置費用",
    defaultValue: "依規格報價・洽詢恆富創新",
    group: "方案費用",
  },
  {
    key: "plan_floor_price",
    label: "落地型自助結帳方案・建置費用",
    defaultValue: "依規格報價・洽詢恆富創新",
    group: "方案費用",
  },

  // 首頁主標題／副標題
  {
    key: "hero_title_line1",
    label: "主標題 第一行",
    defaultValue: "從線上預約到離場關燈，",
    group: "首頁主標題",
  },
  {
    key: "hero_title_line2",
    label: "主標題 第二行（前段文字）",
    defaultValue: "每個環節都能",
    group: "首頁主標題",
  },
  {
    key: "hero_title_accent",
    label: "主標題 強調字（會以主色顯示，後面固定接「。」）",
    defaultValue: "自動完成",
    group: "首頁主標題",
  },
  {
    key: "hero_subtitle",
    label: "副標題說明文字",
    defaultValue:
      "恆富創新的智慧球館管理系統，整合線上預約、會員手機一鍵開門、自助結帳與燈光空調電控，一套系統同時管理羽球場、匹克球場，從預約到離場全程自動化。",
    multiline: true,
    group: "首頁主標題",
  },

  // 為什麼選擇恆富創新／一條龍服務
  {
    key: "why_heading",
    label: "「為什麼選擇恆富創新」區塊標題",
    defaultValue: "我們不只提供系統，而是完整的智慧球館解決方案",
    group: "為什麼選擇恆富創新／一條龍服務",
  },
  {
    key: "turnkey_heading",
    label: "「一站式服務」區塊標題",
    defaultValue: "找到場地後，剩下的交給我們",
    group: "為什麼選擇恆富創新／一條龍服務",
  },
  {
    key: "turnkey_intro",
    label: "一站式服務說明文字",
    defaultValue:
      "只要你找到合適的廠房或空間，恆富創新就能協助整合工班、地墊／地板等專業廠商，完成現場裝修建置，再搭配我們自主研發的智慧球館系統，從硬體到軟體一次到位，不需要自己一家一家發包廠商。",
    multiline: true,
    group: "為什麼選擇恆富創新／一條龍服務",
  },
  {
    key: "turnkey_service_note",
    label: "一條龍服務說明（「一條龍服務：」後面的文字）",
    defaultValue:
      "從場地評估、裝修建置到系統上線，恆富創新協助整合各項專業廠商，讓你不用自己一家一家發包，專注在開店營運本身。",
    multiline: true,
    group: "為什麼選擇恆富創新／一條龍服務",
  },

  // 功能比較表（恆富創新欄）
  {
    key: "compare_checkout",
    label: "比較表：自助結帳・現金收付（恆富創新欄，「●」後面文字）",
    defaultValue: "現金＋電子支付雙軌收款",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_member_app",
    label: "比較表：會員系統網頁版、APP",
    defaultValue: "網頁版＋APP 全部都有",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_member_topup",
    label: "比較表：會員儲值",
    defaultValue: "支援",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_booking_payment",
    label: "比較表：會員線上預約付款",
    defaultValue: "信用卡、LINE Pay 等多元付款",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_access_control",
    label: "比較表：大門／包廂門禁控制",
    defaultValue: "支援",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_setup_support",
    label: "比較表：建置評估對接",
    defaultValue: "專人到場勘查，直接與工班對接",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_reports",
    label: "比較表：後台營運報表",
    defaultValue: "即時查看",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_multi_branch",
    label: "比較表：多分店管理",
    defaultValue: "支援",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_admin_roles",
    label: "比較表：管理者權限分級",
    defaultValue: "支援",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_pricing_setting",
    label: "比較表：場地價格設定",
    defaultValue: "彈性設定，可依時段調整",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_longterm_booking",
    label: "比較表：長租客預約方式",
    defaultValue: "一鍵批次預約，操作快速",
    group: "功能比較表（恆富創新欄）",
  },
  {
    key: "compare_price_level",
    label: "比較表：方案價格（無圓點，純文字）",
    defaultValue: "相對親民",
    group: "功能比較表（恆富創新欄）",
  },

  // 聯絡方式
  {
    key: "contact_phone",
    label: "諮詢專線（顯示用，例：0800-000-589）",
    defaultValue: "0800-000-589",
    group: "聯絡方式",
  },
  {
    key: "contact_email",
    label: "Email",
    defaultValue: "service@hengfu-i.com",
    group: "聯絡方式",
  },
  {
    key: "contact_line_url",
    label: "LINE 官方帳號連結",
    defaultValue: "https://line.me/ti/p/~hengfu-i",
    group: "聯絡方式",
  },
  {
    key: "contact_address",
    label: "總公司地址",
    defaultValue: "彰化縣和美鎮東萊路78號",
    group: "聯絡方式",
  },
];

export function getDefaultContentMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const field of CONTENT_FIELDS) {
    map[field.key] = field.defaultValue;
  }
  return map;
}

// 電話號碼的純數字版本，給 tel: 連結用，會依 contact_phone 自動算出，
// 不是後台可以直接編輯的欄位。
export function derivePhoneTelHref(content: Record<string, string>): string {
  return (content["contact_phone"] ?? "").replace(/[^0-9]/g, "");
}
