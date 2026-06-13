import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const maxDuration = 60;
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { idea } = await req.json();

  if (!idea) {
    return new Response(JSON.stringify({ error: "Idea is required" }), { status: 400 });
  }

  const systemPrompt = `You are an expert SaaS Product Manager. 
Given a rough SaaS idea, you need to provide exactly 3 distinct, professional, and highly relevant options for each category:
1. Target Audience
2. Success Metrics (KPIs)
3. Monetization Strategy (Freemium variations)

Make the options actionable, specific, and realistic. Provide responses in Indonesian language.`;

  try {
    const { object } = await generateObject({
      model: google('gemini-3.1-flash-lite'),
      system: systemPrompt,
      prompt: `SaaS Idea: ${idea}`,
      schema: z.object({
        audiences: z.array(z.string().describe("Specific target audience description")).length(3),
        metrics: z.array(z.string().describe("Specific success metric or KPI")).length(3),
        monetizations: z.array(z.string().describe("Specific freemium monetization strategy")).length(3),
      }),
    });

    return new Response(JSON.stringify(object), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return new Response(JSON.stringify({ error: "Failed to generate suggestions" }), { status: 500 });
  }
}
