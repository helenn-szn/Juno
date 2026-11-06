// The certificate as a PDF, drawn from Certificate.dc.html: A4 landscape (the design's
// 1123×794 px scaled to points), Geist type, the coin fan, and a real QR code.
// Numbers below are design pixels; K turns them into PDF points.
// pdf-lib takes colours as 0 to 1 numbers. Each comment names the brand colour.
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { certificateFacts, type Certificate } from "./certificates";

const W = 1123;
const K = 842 / W;

const white = rgb(1, 1, 1);
const green = rgb(0, 0.302, 0.263); // #004D43
const ink = rgb(0.094, 0.192, 0.196); // #183132
const muted = rgb(0.29, 0.38, 0.369); // #4A615E
const radiant = rgb(0.816, 1, 0.443); // #D0FF71
const radiantSide = rgb(0.608, 0.78, 0.282); // #9BC748
const purple = rgb(0.561, 0.576, 1); // #8F93FF
const purpleSide = rgb(0.384, 0.4, 0.831); // #6266D4
const soft = rgb(0.812, 0.89, 0.867); // #CFE3DD
const hairline = rgb(0.173, 0.416, 0.369); // #2C6A5E

const font = (name: string) => fs.readFile(path.join(process.cwd(), "assets", "fonts", name));

type Palette = { stem: ReturnType<typeof rgb>; face: ReturnType<typeof rgb>; side: ReturnType<typeof rgb>; line: ReturnType<typeof rgb> };

// The coin fan, from the logo's SVG, drawn as paths. Coordinates are the SVG's own.
function drawFan(page: PDFPage, left: number, top: number, width: number, palette: Palette) {
  const s = (width * K) / 156;
  const originX = left * K;
  const originY = 595 - top * K;
  const shift = (x: number, y: number): [number, number] => [x + 8, y - 30];
  const turn = (x: number, y: number, angle: number): [number, number] => {
    const a = (angle * Math.PI) / 180;
    const dx = x - 70;
    const dy = y - 124;
    return shift(70 + dx * Math.cos(a) - dy * Math.sin(a), 124 + dx * Math.sin(a) + dy * Math.cos(a));
  };
  const ellipse = (cx: number, cy: number, rx: number, ry: number, angle: number) => {
    const k = 0.5523;
    const p = (x: number, y: number) => turn(x, y, angle).map((n) => n.toFixed(2)).join(" ");
    return `M ${p(cx + rx, cy)} C ${p(cx + rx, cy + k * ry)} ${p(cx + k * rx, cy + ry)} ${p(cx, cy + ry)} C ${p(cx - k * rx, cy + ry)} ${p(cx - rx, cy + k * ry)} ${p(cx - rx, cy)} C ${p(cx - rx, cy - k * ry)} ${p(cx - k * rx, cy - ry)} ${p(cx, cy - ry)} C ${p(cx + k * rx, cy - ry)} ${p(cx + rx, cy - k * ry)} ${p(cx + rx, cy)} Z`;
  };
  const rect = (x: number, y: number, w: number, h: number, angle: number) =>
    `M ${[[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map(([px, py]) => turn(px, py, angle).join(" ")).join(" L ")} Z`;
  const draw = (d: string, fill?: ReturnType<typeof rgb>, stroke?: ReturnType<typeof rgb>) =>
    page.drawSvgPath(d, {
      x: originX,
      y: originY,
      scale: s,
      color: fill,
      borderColor: stroke,
      borderWidth: stroke ? 2 * s : 0,
    });

  for (const angle of [-60, -30, 0, 30, 60]) {
    const [x1, y1] = turn(70, 122, angle);
    const [x2, y2] = turn(70, 70, angle);
    page.drawLine({
      start: { x: originX + x1 * s, y: originY - y1 * s },
      end: { x: originX + x2 * s, y: originY - y2 * s },
      thickness: 5 * s,
      color: palette.stem,
    });
  }
  for (const angle of [-60, 60, -30, 30, 0]) {
    const hero = angle === 0;
    const face = hero ? purple : palette.face;
    const side = hero ? purpleSide : palette.side;
    draw(ellipse(74.5, 54, 13, 15, angle), side, palette.line);
    draw(rect(70, 39, 4.5, 30, angle), side);
    draw(ellipse(70, 54, 13, 15, angle), face, palette.line);
    draw(ellipse(70, 54, 8, 9.5, angle), undefined, palette.line);
  }
  draw("M62,94 A16,5 0 0,0 94,94 L94,99 A16,5 0 0,1 62,99 Z", palette.side, palette.line);
  draw(ellipse(70, 124, 16, 5, 0), palette.face, palette.line);
}

// A rectangle path with a different radius on each corner (top-left, top-right, bottom-right, bottom-left).
function roundedPath(w: number, h: number, [tl, tr, br, bl]: number[], open = false) {
  const arc = (r: number, x: number, y: number) => (r ? `A ${r} ${r} 0 0 1 ${x} ${y}` : `L ${x} ${y}`);
  return [
    open ? `M ${w} 0` : `M ${tl} 0 H ${w - tr}`,
    open ? "" : arc(tr, w, tr),
    open ? "" : `V ${h - br}`,
    open ? `V ${h - br}` : "",
    arc(br, w - br, h),
    `H ${bl}`,
    arc(bl, 0, h - bl),
    `V ${tl}`,
    arc(tl, tl, 0),
    open ? `H ${w}` : "Z",
  ].join(" ");
}

export async function certificatePdf(certificate: Certificate, qrDataUrl: string) {
  const facts = certificateFacts(certificate);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${certificate.courseTitle} certificate`);
  pdf.setAuthor("Juno");
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(await font("Geist-Regular.ttf"), { subset: true });
  const medium = await pdf.embedFont(await font("Geist-Medium.ttf"), { subset: true });
  const mono = await pdf.embedFont(await font("GeistMono-Regular.ttf"), { subset: true });

  // Text, placed by the top of its line box like the design, with optional letter-spacing in em.
  const text = (value: string, x: number, top: number, lineHeight: number, size: number, face: PDFFont, color: ReturnType<typeof rgb>, spacing = 0) => {
    const baseline = top + lineHeight / 2 + size * 0.33;
    let cursor = x;
    if (!spacing) return page.drawText(value, { x: x * K, y: 595 - baseline * K, size: size * K, font: face, color });
    for (const char of value) {
      page.drawText(char, { x: cursor * K, y: 595 - baseline * K, size: size * K, font: face, color });
      cursor += face.widthOfTextAtSize(char, size * K) / K + spacing * size;
    }
  };
  const width = (value: string, size: number, face: PDFFont, spacing = 0) =>
    face.widthOfTextAtSize(value, size * K) / K + spacing * size * [...value].length;
  const fit = (value: string, size: number, face: PDFFont, spacing: number, max: number) =>
    Math.min(size, size * (max / width(value, size, face, spacing)));
  const path = (d: string, x: number, y: number, options: { color?: ReturnType<typeof rgb>; borderColor?: ReturnType<typeof rgb>; borderWidth?: number }) =>
    page.drawSvgPath(d, { x: x * K, y: 595 - y * K, scale: K, ...options, borderWidth: (options.borderWidth ?? 0) * K });

  // Left panel: a green outline, open on the right.
  path(roundedPath(739, 730, [16, 0, 0, 16], true), 32, 32, { borderColor: green, borderWidth: 1.5 });
  const x0 = 90;
  const inner = 625;

  drawFan(page, x0, 82, 44, { stem: green, face: green, side: ink, line: white });
  text("juno", x0 + 52, 82, 31, 26, medium, green, -0.05);

  text("CERTIFICATE OF COMPLETION", x0, 168.5, 16, 13, regular, green, 0.28);
  text("This certifies that", x0, 198.5, 19, 16, regular, muted);
  const nameSize = fit(certificate.name, 58, medium, -0.045, inner);
  text(certificate.name, x0, 231.5, 61, nameSize, medium, ink, -0.045);
  text("has completed the course", x0, 306.4, 19, 16, regular, muted);
  const courseSize = fit(certificate.courseTitle, 30, medium, -0.03, inner - 28);
  const chipWidth = width(certificate.courseTitle, courseSize, medium, -0.03) + 28;
  path(roundedPath(chipWidth, 48, [10, 10, 10, 10]), x0, 339.4, { color: radiant });
  text(certificate.courseTitle, x0 + 14, 339.4, 48, courseSize, medium, green, -0.03);

  const date = new Date(certificate.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  [["Date issued", date], ["Level", facts.level], ["Skill coins earned", String(facts.coins)]].forEach(([label, value], index) => {
    const x = x0 + index * 194.67;
    text(label, x, 427.4, 14.5, 12, regular, muted);
    text(value, x, 445.9, 19, 16, medium, ink);
  });

  [[facts.mentor, "Reviewing mentor"], ["Juno", "Issuer"]].forEach(([name, role], index) => {
    const x = x0 + index * 268;
    page.drawLine({ start: { x: x * K, y: 595 - 669 * K }, end: { x: (x + 220) * K, y: 595 - 669 * K }, thickness: K, color: ink });
    text(name, x, 675, 17, 14, medium, ink);
    text(role, x, 698, 14.5, 12, regular, muted);
  });

  // Right panel.
  path(roundedPath(320, 730, [0, 16, 16, 0]), 771, 32, { color: green });
  drawFan(page, 821, 72, 220, { stem: radiant, face: radiant, side: radiantSide, line: green });
  const pill = "Verified on Stellar";
  const pillWidth = width(pill, 13, medium) + 28;
  path(roundedPath(pillWidth, 28, [14, 14, 14, 14]), 931 - pillWidth / 2, 244, { color: purple });
  text(pill, 931 - pillWidth / 2 + 14, 244, 28, 13, medium, ink);

  path(roundedPath(144, 144, [12, 12, 12, 12]), 859, 473, { color: white });
  page.drawImage(await pdf.embedPng(qrDataUrl), { x: 871 * K, y: 595 - 605 * K, width: 120 * K, height: 120 * K });
  const scan = "Scan to verify";
  text(scan, 931 - width(scan, 13, regular) / 2, 637, 16, 13, regular, soft);

  const lines = [`ID · ${certificate.id}`, ...(certificate.transaction ? [`Tx · ${certificate.transaction.slice(0, 34)}`, `      ${certificate.transaction.slice(34)}`] : ["Tx · being recorded on Stellar"])];
  const top = 722 - (17 + lines.length * 15);
  page.drawLine({ start: { x: 803 * K, y: 595 - top * K }, end: { x: 1059 * K, y: 595 - top * K }, thickness: K, color: hairline });
  lines.forEach((line, index) => text(line, 803, top + 17 + index * 15, 13, 9.5, mono, soft));

  return pdf.save();
}
