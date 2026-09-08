// 首頁上可以在後台編輯的文字內容。key 對應 content/body.html 裡的
// <!--CONTENT:xxx--> 標記；每個 key 都要有一個預設值，這樣資料庫讀取
//失敗或該筆資料還沒建立時，網站也不會開天窗。
//
// 之後要讓更多文字變成可編輯，就在這裡加一筆 { key, label, defaultValue }，
// 再到 content/body.html 對應位置插入 <!--CONTENT:新key--> 標記即可，
// 不需要改動 app/admin/(protected)/content 或 API route。

export type ContentField = {
  key: string;
  label: string;
  defaultValue: string;
  multiline?: boolean;
};

export const CONTENT_FIELDS: ContentField[] = [
  {
    key: "plan_desktop_price",
    label: "桌上型控制方案・建置費用",
    defaultValue: "依規格報價・洽詢恆富創新",
  },
  {
    key: "plan_floor_price",
    label: "落地型自助結帳方案・建置費用",
    defaultValue: "依規格報價・洽詢恆富創新",
  },
];

export function getDefaultContentMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const field of CONTENT_FIELDS) {
    map[field.key] = field.defaultValue;
  }
  return map;
}
