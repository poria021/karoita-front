import fs from "fs";
import path from "path";

const root = "src/services";
const files = [];

function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
}
walk(root);

function inScope(rel) {
  const n = rel.replace(/\\/g, "/").replace(/^src\/services\//, "");
  return (
    /\/(mock|real)\//.test("/" + n) ||
    /^(mock|organization-options|admin-catalog|files|users|notifications|profile|landing-cms|auth)\//.test(
      n
    )
  );
}

for (const f of files) {
  const rel = f.replace(/\\/g, "/");
  if (!inScope(rel)) continue;
  const t = fs.readFileSync(f, "utf8");
  const comments = [];
  for (const m of t.matchAll(/\/\*[\s\S]*?\*\//g)) {
    const line = t.slice(0, m.index).split("\n").length;
    comments.push({
      line,
      text: m[0].slice(0, 240).replace(/\n/g, " | "),
    });
  }
  const lines = t.split("\n");
  lines.forEach((l, i) => {
    if (/^\s*\/\//.test(l))
      comments.push({ line: i + 1, text: l.trim().slice(0, 180) });
  });
  const english = comments.filter((c) => /[A-Za-z]{4,}/.test(c.text));
  const hasFileDoc = /^\s*('use client';\s*)?\/\*\*/.test(t);
  const trivial =
    /export \* from|export \{[^}]+\} from/.test(t) && lines.length < 15;
  if (english.length || !hasFileDoc) {
    console.log(
      `\n== ${rel} == lines=${lines.length} fileDoc=${hasFileDoc} trivial=${trivial} comments=${comments.length} en=${english.length}`
    );
    for (const c of english.slice(0, 30))
      console.log(`  L${c.line}: ${c.text}`);
  }
}
