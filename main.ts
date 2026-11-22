// main.ts — TikTok ad entry for make.fun bring-the-humans-03 ("How to Join").
// Node 22, stdlib only. Copies VIDEO.json into the output directory and
// validates that it names a real TikTok video posted from this entry's
// account. The video is posted from Budi's TikTok account @approximatelly888
// (the account was @Approximatelly6 when the bounty opened and TikTok renamed
// it mid-upload; Budi's other TikTok account is @approximatelly), so all
// three handles name an account this entry may post from and any of them is
// accepted below.
//
// The repo's VIDEO.json ships with the placeholder URL
// https://www.tiktok.com/@approximatelly888/video/0000000000000000000 and is
// replaced with the real posted URL before submit. A placeholder URL is a
// hard error, since a submitted entry must name a real posted video.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
// The account this entry posts from (@approximatelly888), its handle before
// TikTok renamed it (@Approximatelly6), and Budi's other TikTok account
// (@approximatelly): all three name an account this entry may post from.
const HANDLES = ["@approximatelly888", "@Approximatelly6", "@approximatelly"];
const VIDEO_RE = /^https:\/\/www\.tiktok\.com\/@([A-Za-z0-9._]+)\/video\/([0-9]+)$/;

const src = join(botDir, "VIDEO.json");
const raw = readFileSync(src, "utf8");
let video;
try {
  video = JSON.parse(raw);
} catch {
  console.error("VIDEO.json is not valid JSON");
  process.exit(1);
}
if (typeof video.url !== "string" || video.url.length === 0) {
  console.error("VIDEO.json must contain a string field 'url'");
  process.exit(1);
}
const match = VIDEO_RE.exec(video.url);
if (!match) {
  console.error(`VIDEO.json url is not a full TikTok video address: ${video.url}`);
  process.exit(1);
}
if (!HANDLES.includes(`@${match[1]}`)) {
  console.error(`VIDEO.json url names @${match[1]} but this entry posts from ${HANDLES.join(" or ")}`);
  process.exit(1);
}
if (/^0+$/.test(match[2])) {
  console.error("VIDEO.json url still holds the placeholder video id; replace it with the posted video's address before submitting.");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(src, join(outDir, "VIDEO.json"));
const summary = {
  competition: "bring-the-humans-03",
  title: "How to Join make.fun in 3 Steps",
  url: video.url,
  placeholder: false,
  copied_to: join(outDir, "VIDEO.json"),
};
writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(`OK: VIDEO.json -> ${join(outDir, "VIDEO.json")}`);
console.log(`URL: ${video.url}`);
