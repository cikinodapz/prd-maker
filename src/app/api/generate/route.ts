import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { idea, audience, metrics, monetization, roastMode } = await req.json();

  // Determine the prompt based on whether it's a Roast or PRD generation
  let systemPrompt = '';
  let userPrompt = '';

  if (roastMode) {
    systemPrompt = `You are a brutal, realistic, but helpful Silicon Valley investor and Product Manager. 
Your goal is to "roast" the user's SaaS idea to find flaws, potential failure points, and suggest ways to pivot or make it more niche.
Focus on the viability of a Freemium SaaS model for this idea. Keep it concise, punchy, and actionable. Be honest but not purely insulting.
Answer in the same language the user used (usually Indonesian or English).`;

    userPrompt = `Please roast my SaaS idea:
Idea: ${idea}
Target Audience: ${audience}
Success Metrics: ${metrics}
Monetization: ${monetization}`;
  } else {
    systemPrompt = `You are an expert SaaS Product Manager. Your task is to generate a comprehensive, professional Product Requirements Document (PRD) for a SaaS Freemium application.
Structure the PRD using Markdown with the following sections:
1. **Executive Summary**: High-level overview of the product and its core value proposition.
2. **Target Audience & User Personas**: Create 2-3 specific user personas based on the target audience.
3. **Core Features (MoSCoW)**:
   - Must Have (MVP - Free Tier)
   - Should Have (Premium Tier)
   - Could Have (Future Roadmap)
   - Won't Have (Non-Goals to prevent scope creep)
4. **Monetization Strategy**: How the freemium model works, potential pricing tiers, and limits for free users.
5. **Success Metrics (KPIs/OKRs)**: The metrics to track success.
6. **Recommended Tech Stack & Architecture**: Suggest the best modern tech stack for this SaaS.

Format the output clearly with headings, bullet points, and bold text. Respond primarily in the language of the user's input (Indonesian or English).`;

    userPrompt = `Please generate a PRD based on these parameters:
Idea & Problem to Solve: ${idea}
Target Audience: ${audience}
Goals & Success Metrics: ${metrics}
Monetization Ideas: ${monetization}`;
  }

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    system: systemPrompt,
    prompt: userPrompt,
  });

  return result.toTextStreamResponse();
}
