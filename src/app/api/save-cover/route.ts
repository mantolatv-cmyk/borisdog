import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { slug, base64 } = await req.json();
    if (!slug || !base64) {
      return NextResponse.json({ error: "Missing slug or base64" }, { status: 400 });
    }

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const dir = path.join(process.cwd(), "public", "images", "scenarios");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${slug}.png`);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, path: `/images/scenarios/${slug}.png` });
  } catch (error) {
    console.error("Error saving cover:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
