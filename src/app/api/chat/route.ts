import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(req: Request) {
  try {
    const { messages, documentContext } = await req.json();

    const systemPrompt = `Anda adalah Product Manager Assistant (AI). 
Pengguna sedang mengedit sebuah Product Requirements Document (PRD).

Konteks PRD Saat Ini:
${documentContext ? documentContext : "(Dokumen masih kosong)"}

Tugas Anda:
- Menjawab pertanyaan terkait PRD atau manajemen produk.
- Memberikan saran perbaikan atau tambahan teks.
- Jika pengguna meminta Anda untuk merevisi, mengedit, atau menghapus paragraf tertentu dalam skala besar, Anda HARUS me-rewrite seluruh isi dokumen yang sudah direvisi ke dalam blok \`\`\`markdown-full ... \`\`\`.
- Jika pengguna hanya minta ide atau tambahan teks yang bisa disisipkan, gunakan blok \`\`\`markdown ... \`\`\`.
- Gunakan bahasa Indonesia yang profesional namun santai (ala startup tech).
- Format jawaban Anda sejelas mungkin.`;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to chat" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
