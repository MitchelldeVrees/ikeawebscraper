import { NextResponse } from "next/server";

export async function GET() {
  const csv = ["productid,quantity", "50487857,1", "30563951,2"].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ikea-watch-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}

