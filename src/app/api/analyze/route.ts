import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ summary: "API Key tidak ada." }, { status: 500 });

    // KOMBINESI TERAKHIR: v1beta + gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Analisa singkat (maks 10 kata) trading log ini: "${content}"` }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("DEBUG ERROR GOOGLE:", data.error);
      throw new Error(data.error.message);
    }

    // Pastikan struktur response benar
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiText = data.candidates[0].content.parts[0].text;
      return NextResponse.json({ summary: aiText.trim() });
    }
    
    throw new Error("Struktur response tidak sesuai");

  } catch (error: any) {
    console.error("LOG AKHIR:", error.message);
    return NextResponse.json({ summary: "AI sedang sinkronisasi. Coba lagi dalam 1 menit." }, { status: 500 });
  }
}