/**
 * Turn rows into a CSV file that opens cleanly in Excel, Numbers, and Google Sheets.
 * Every value is quoted; quotes inside are doubled; a leading = + - @ gets a space so a
 * spreadsheet never treats a cell as a formula (a classic way to smuggle a command into a sheet).
 */
export function toCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const cell = (v: string | number | boolean | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = " " + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))];
  return "﻿" + lines.join("\r\n") + "\r\n"; // BOM so Excel reads accents correctly
}
