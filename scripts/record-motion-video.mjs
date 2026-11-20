import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = process.env.NOTIQ_URL || "http://localhost:3000";
const RAW_DIR = path.resolve(".tmp-motion-raw");
const OUT_DIR = path.resolve("public/motion");
const OUT_MP4 = path.join(OUT_DIR, "notiq-demo.mp4");

fs.mkdirSync(RAW_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

async function injectOverlay(page) {
  await page.evaluate(() => {
    if (document.getElementById("notiq-motion-overlay")) return;

    const style = document.createElement("style");
    style.textContent = `
      #notiq-motion-cursor {
        position: fixed;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        border: 2px solid #6366f1;
        background: rgba(99, 102, 241, 0.22);
        box-shadow: 0 0 18px rgba(99, 102, 241, 0.55);
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: left 0.35s cubic-bezier(0.22, 1, 0.36, 1), top 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.12s ease;
      }
      #notiq-motion-cursor.click {
        transform: translate(-50%, -50%) scale(0.72);
        background: rgba(16, 185, 129, 0.45);
        border-color: #10b981;
      }
      #notiq-motion-caption {
        position: fixed;
        bottom: 22px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999998;
        padding: 10px 22px;
        border-radius: 9999px;
        background: rgba(9, 13, 22, 0.9);
        border: 1px solid rgba(99, 102, 241, 0.45);
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.02em;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(12px);
        pointer-events: none;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);

    const wrap = document.createElement("div");
    wrap.id = "notiq-motion-overlay";

    const cursor = document.createElement("div");
    cursor.id = "notiq-motion-cursor";
    cursor.style.left = "640px";
    cursor.style.top = "360px";

    const caption = document.createElement("div");
    caption.id = "notiq-motion-caption";
    caption.textContent = "Notiq v1.4.0 · Real-Time Collaborative Workspace";

    wrap.appendChild(cursor);
    wrap.appendChild(caption);
    document.body.appendChild(wrap);
  });
}

async function setCaption(page, text) {
  await injectOverlay(page);
  await page.evaluate((t) => {
    const el = document.getElementById("notiq-motion-caption");
    if (el) el.textContent = t;
  }, text);
}

async function moveAndClick(page, locator) {
  try {
    await locator.scrollIntoViewIfNeeded();
  } catch {
    // ignore
  }
  const box = await locator.boundingBox();
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.evaluate(
      ({ x, y }) => {
        const c = document.getElementById("notiq-motion-cursor");
        if (c) {
          c.style.left = `${x}px`;
          c.style.top = `${y}px`;
        }
      },
      { x, y }
    );
    await page.waitForTimeout(340);
    await page.evaluate(() => {
      const c = document.getElementById("notiq-motion-cursor");
      c?.classList.add("click");
      setTimeout(() => c?.classList.remove("click"), 160);
    });
  }
  await locator.click();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    colorScheme: "dark",
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  const roomId = `showcase-${Date.now().toString(36)}`;

  // 1. Fresh blank editor on /collaboration
  await page.goto(`${BASE_URL}/collaboration?room=${roomId}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(900);
  await setCaption(page, "01 · Blank Collaborative Canvas · Live Yjs Sync");

  const editor = page.locator('[contenteditable="true"]').first();
  await moveAndClick(page, editor);
  await page.waitForTimeout(400);

  // Type Markdown heading & smart typography
  await setCaption(page, "02 · Markdown Shortcuts & Smart Typography");
  await page.keyboard.type("# Notiq v1.4.0 Launch Spec", { delay: 42 });
  await page.keyboard.press("Enter");
  await page.keyboard.type("Real-time CRDT editing -> zero conflicts, offline-first.", { delay: 34 });
  await page.keyboard.press("Enter");
  await page.keyboard.type("- [x] Yjs WebSocket + IndexedDB Persistence", { delay: 32 });
  await page.keyboard.press("Enter");
  await page.keyboard.type("- [ ] Launch @collabchron/notiq@1.4.0", { delay: 32 });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);

  // 3. Slash command -> Database Table -> Kanban
  await setCaption(page, "03 · /database — Interactive Table & Kanban Board");
  await page.keyboard.type("/database", { delay: 60 });
  await page.waitForTimeout(650);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(850);

  const kanbanTab = page.getByRole("tab", { name: "Kanban" }).first();
  if (await kanbanTab.isVisible()) {
    await moveAndClick(page, kanbanTab);
    await page.waitForTimeout(850);
    const moveRight = page.locator('button[aria-label$="right"]').first();
    if (await moveRight.isVisible()) {
      await moveAndClick(page, moveRight);
      await page.waitForTimeout(700);
    }
  }

  // 4. [[Page]] Links & @Mentions / Smart Dates
  await moveAndClick(page, editor);
  await page.keyboard.press("Control+End");
  await page.keyboard.press("Enter");
  await setCaption(page, "04 · [[Page]] Backlinks & @Smart Date Chips");
  await page.keyboard.type("Linked doc: [[", { delay: 50 });
  await page.waitForTimeout(650);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);

  await page.keyboard.type(" · Target @today", { delay: 50 });
  await page.waitForTimeout(650);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  const backlinksToggle = page.getByRole("button", { name: /Page Links & Backlinks/i }).first();
  if (await backlinksToggle.isVisible()) {
    await moveAndClick(page, backlinksToggle);
    await page.waitForTimeout(700);
  }

  // 5. Inline Image + Floating Toolbar + Lightbox
  await moveAndClick(page, editor);
  await page.keyboard.press("Control+End");
  await page.keyboard.press("Enter");
  await setCaption(page, "05 · Inline Image + Vector SVG + Lightbox Zoom");
  await page.keyboard.type("/inline", { delay: 60 });
  await page.waitForTimeout(650);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(600);

  const fromUrlBtn = page.getByRole("button", { name: "From URL" }).first();
  if (await fromUrlBtn.isVisible()) {
    await moveAndClick(page, fromUrlBtn);
    await page.waitForTimeout(300);
    const urlInput = page.locator("#inline-image-url-input");
    await urlInput.fill(`${BASE_URL}/vectors/notiq-architecture.svg`);
    await page.waitForTimeout(500);
    const fullBtn = page.getByRole("radio", { name: "Full Width" }).first();
    if (await fullBtn.isVisible()) {
      await moveAndClick(page, fullBtn);
    }
    const insertBtn = page.getByRole("button", { name: "Insert Image" }).first();
    await moveAndClick(page, insertBtn);
    await page.waitForTimeout(900);

    // Open Lightbox Zoom
    const zoomBtn = page.getByRole("button", { name: "Preview full size" }).first();
    if (await zoomBtn.isVisible()) {
      await moveAndClick(page, zoomBtn);
      await page.waitForTimeout(750);
      const zoomInBtn = page.getByRole("button", { name: "Zoom in" }).first();
      if (await zoomInBtn.isVisible()) {
        await moveAndClick(page, zoomInBtn);
        await page.waitForTimeout(700);
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  }

  // 6. Share / Room Menu + Final CTA
  await setCaption(page, "06 · Share Room, Presence & Comments · npm i @collabchron/notiq@1.4.0");
  const shareBtn = page.getByRole("button", { name: "Share or switch collaboration room" }).first();
  if (await shareBtn.isVisible()) {
    await moveAndClick(page, shareBtn);
    await page.waitForTimeout(1500);
  } else {
    await page.waitForTimeout(1500);
  }

  const video = page.video();
  await context.close();
  await browser.close();

  const rawVideoPath = await video.path();
  console.log("Raw recording:", rawVideoPath);

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      rawVideoPath,
      "-vf",
      "fade=t=in:st=0:d=0.5",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      OUT_MP4,
    ],
    { stdio: "inherit" }
  );

  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  console.log("Produced polished MP4:", OUT_MP4);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
