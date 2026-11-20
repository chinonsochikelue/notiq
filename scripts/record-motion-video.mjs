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
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999998;
        padding: 10px 20px;
        border-radius: 9999px;
        background: rgba(9, 13, 22, 0.88);
        border: 1px solid rgba(99, 102, 241, 0.4);
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.02em;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(12px);
        pointer-events: none;
        transition: opacity 0.3s ease;
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
    caption.textContent = "Notiq v1.4.0 · Collaborative AI Workspace";

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
    await page.waitForTimeout(380);
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

  // 1. Open Playground
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await setCaption(page, "01 · Notiq Playground — Rich Lexical + AI Editor");
  await page.waitForTimeout(1200);

  // Focus editor & add a new section at the bottom
  const editor = page.locator('[contenteditable="true"]').first();
  await moveAndClick(page, editor);
  await page.keyboard.press("Control+End");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");

  await setCaption(page, "02 · Slash Commands — Insert Database & Kanban Board");
  await page.keyboard.type("/database", { delay: 65 });
  await page.waitForTimeout(700);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(900);

  // Switch Database to Kanban View
  const kanbanTab = page.getByRole("tab", { name: "Kanban" }).first();
  if (await kanbanTab.isVisible()) {
    await kanbanTab.scrollIntoViewIfNeeded();
    await setCaption(page, "03 · Instant Table ↔ Kanban View Switching");
    await moveAndClick(page, kanbanTab);
    await page.waitForTimeout(1000);

    // Move first card right if available
    const moveRight = page.locator('button[aria-label$="right"]').first();
    if (await moveRight.isVisible()) {
      await moveAndClick(page, moveRight);
      await page.waitForTimeout(800);
    }
  }

  // Type [[Page]] link and @today mention
  await moveAndClick(page, editor);
  await page.keyboard.press("Control+End");
  await page.keyboard.press("Enter");
  await setCaption(page, "04 · [[Page]] Backlinks & @Smart Date Chips");
  await page.keyboard.type("Next: [[", { delay: 60 });
  await page.waitForTimeout(750);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);

  await page.keyboard.type(" · Due @today", { delay: 60 });
  await page.waitForTimeout(750);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(900);

  // Navigate to /collaboration
  await setCaption(page, "05 · Real-Time Multiplayer Sync (Yjs + WebSocket)");
  await page.goto(`${BASE_URL}/collaboration`, { waitUntil: "networkidle" });
  await injectOverlay(page);
  await setCaption(page, "05 · Live Collaboration · wss://notiqcollabserver.collabchron.com.ng");
  await page.waitForTimeout(2200);

  await setCaption(page, "Install globally: npm install @collabchron/notiq@1.4.0");
  await page.waitForTimeout(1600);

  const video = page.video();
  await context.close();
  await browser.close();

  const rawVideoPath = await video.path();
  console.log("Raw recording:", rawVideoPath);

  // Convert & polish with ffmpeg into high-quality H.264 MP4
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
