"use client";

import { useEffect } from "react";

/**
 * Injects the site's interactive behaviour (scroll reveals, count-up
 * numbers, FAQ accordion, door-access demo, chip toggles, the lead form
 * submit handler, and the ROI calculator) as a real <script> element.
 *
 * Scripts inserted via dangerouslySetInnerHTML never execute in the
 * browser, so this appends the element imperatively instead — the exact
 * same technique the marketing page used before it moved into Next.js.
 */
export default function SiteScripts({ code }: { code: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.text = code;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [code]);

  return null;
}
