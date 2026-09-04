import fs from "node:fs";
import path from "node:path";
import SiteScripts from "./SiteScripts";

export default function Page() {
  const bodyHtml = fs.readFileSync(
    path.join(process.cwd(), "content", "body.html"),
    "utf8"
  );
  const siteScript = fs.readFileSync(
    path.join(process.cwd(), "content", "site.js"),
    "utf8"
  );

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <SiteScripts code={siteScript} />
    </>
  );
}
