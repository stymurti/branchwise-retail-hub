// Utility to open a printable HTML document in a new window

export function printDocument(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) {
    alert("Pop-up diblokir. Izinkan pop-up untuk mencetak.");
    return;
  }
  w.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color:#111; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 0 0 16px; color:#555; font-weight:500; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
  th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; }
  th { background:#f0f0f0; }
  .right { text-align: right; }
  .center { text-align: center; }
  .meta { display:grid; grid-template-columns: 1fr 1fr; gap:8px 24px; margin: 16px 0; font-size: 12px; }
  .meta div b { display:inline-block; min-width:120px; }
  .total { font-weight: bold; font-size: 14px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #111; padding-bottom:12px; margin-bottom:8px; }
  .brand { font-size:22px; font-weight:bold; }
  .signs { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; margin-top:48px; font-size:12px; text-align:center; }
  .sign-line { margin-top:60px; border-top:1px solid #111; padding-top:4px; }
  @media print { body { padding: 0; } .no-print { display:none; } }
</style>
</head>
<body>
${bodyHtml}
<div class="no-print" style="margin-top:24px; text-align:center;">
  <button onclick="window.print()" style="padding:10px 24px; font-size:14px; cursor:pointer;">Cetak Sekarang</button>
</div>
<script>setTimeout(()=>window.print(),300);</script>
</body>
</html>`);
  w.document.close();
}

export function fmtIDR(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
