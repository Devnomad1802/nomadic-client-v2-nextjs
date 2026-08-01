#!/usr/bin/env node
// Color-drift guard — blocks retired hexes from creeping back into src/.
// Run: node scripts/check-colors.mjs  (wired into npm run lint:colors)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const RETIRED = [
  "#CD482A","#C4472C","#D24B2A","#FF0E07","#EC3F18","#B53B20","#B83E21",
  "#111827","#1F2937","#374151","#4B5563","#6B7280","#6D7280","#9CA3AF",
  "#D1D5DB","#E5E7EB","#F3F4F6","#F9FAFB","#FBFBFB","#F5F5F5","#F0F0F0",
  "#E0E0E0","#D6D6D6","#1E1E1E","#393938",
  "#16A34A","#5BBF7A","#1F7A45","#FBC800","#58C5DA",
  "#FFF4F1","#F6DCD3","#FBE3D7",
  // retired: old clay/cream palette (redesign -> ember/pine/brass/stone)
  "#CF4A2C","#E9622F","#B83F23","#F6E4DC","#FDF3EE","#221C17","#3C3228","#5A5247",
  "#726A5E","#8A8073","#A89C8A","#D8CFC0","#E6DDCF","#F1EADD","#F4EEE4","#9A9080",
  "#FFFDF9","#FBF6EE","#F8F4ED","#FFF6EF","#2E7D4F","#C8941E","#C0392B","#3D6B8A","#F0A03C",
].map((h) => h.toLowerCase());

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if ([".js",".jsx",".ts",".tsx",".css"].includes(extname(p))) out.push(p);
  }
  return out;
};

let bad = 0;
for (const file of walk("src")) {
  const text = readFileSync(file, "utf8").toLowerCase();
  for (const hex of RETIRED) {
    if (text.includes(hex)) { console.error(`✗ ${file}: retired color ${hex} — use a token`); bad++; }
  }
}
if (bad) { console.error(`\n${bad} retired-color use(s).`); process.exit(1); }
console.log("✓ no retired colors in src/");
