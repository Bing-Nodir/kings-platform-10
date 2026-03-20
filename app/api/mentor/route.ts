import Anthropic from "@anthropic-ai/sdk";
import { getCourseById } from "@/lib/catalog";
import { getAuthenticatedContext, hasCourseEnrollment } from "@/lib/server/auth";
import { getAnthropicConfig, hasConfiguredAnthropicKey } from "@/lib/server/env";
import {
  clampNumber,
  normalizeSingleLine,
  sanitizeChatHistory,
} from "@/lib/server/validation";

export async function POST(req: Request) {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { apiKey, model } = getAnthropicConfig();
  if (!hasConfiguredAnthropicKey(apiKey)) {
    return Response.json(
      {
        error:
          "AI Mentor hali to'liq sozlanmagan. `ANTHROPIC_API_KEY` qiymatini yangilang.",
      },
      { status: 503 }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    messages?: unknown[];
    courseId?: string;
    lessonTitle?: string;
    progressPercent?: number;
  } | null;

  const courseId = normalizeSingleLine(body?.courseId, 120);
  if (!courseId) {
    return Response.json({ error: "Kurs identifikatori topilmadi." }, { status: 400 });
  }

  const course = getCourseById(courseId);
  if (!course) {
    return Response.json({ error: "Kurs topilmadi." }, { status: 404 });
  }

  if (!(await hasCourseEnrollment(supabase, user.id, courseId))) {
    return Response.json(
      { error: "AI Mentor faqat enrolled o'quvchilar uchun ochiq." },
      { status: 403 }
    );
  }

  const messages = sanitizeChatHistory(body?.messages, {
    maxMessages: 20,
    maxContentLength: 3000,
  });

  if (messages.length === 0) {
    return Response.json({ error: "Savol matnini yuboring." }, { status: 400 });
  }

  const lessonTitle = normalizeSingleLine(body?.lessonTitle, 160);
  const progressPercent =
    typeof body?.progressPercent === "number" &&
    Number.isFinite(body.progressPercent)
      ? clampNumber(Math.round(body.progressPercent), 0, 100)
      : undefined;

  const anthropic = new Anthropic({
    apiKey,
  });

  const systemPrompt = `Siz Kings Education platformasining AI Mentoridasiz. Sizning vazifangiz - o'quvchilarga kursdagi darslarni sodda, aniq va amaliy usulda tushuntirish.

Hozirgi kurs: "${course.title}"
Yo'nalish: ${course.category}
O'qituvchi: ${course.instructor}
Daraja: ${course.level}
${lessonTitle ? `Faol dars: "${lessonTitle}"` : ""}
${progressPercent !== undefined ? `O'quvchining progressi: ${progressPercent}%` : ""}

Kurs modullari:
${course.modules
  .map(
    (module) =>
      `- ${module.title}: ${module.lessons
        .map((lesson) => lesson.title)
        .join(", ")}`
  )
  .join("\n")}

Qoidalar:
1. Har doim O'zbek tilida javob bering.
2. Qisqa, aniq va amaliy bo'ling.
3. Kerak bo'lsa dars mavzusiga mos mini misol keltiring.
4. O'quvchini rag'batlantiring va keyingi qadamni ko'rsating.
5. Murakkab tushunchalarni oddiy til va analogiya bilan tushuntiring.
6. Xatoni ko'rsangiz, nima uchun noto'g'ri ekanini ham izohlang.
7. Agar mavzu kursdan tashqariga chiqsa ham, foydali va professional yo'nalish bering.`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model,
          max_tokens: 1024,
          thinking: { type: "adaptive" },
          system: systemPrompt,
          messages,
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const chunk = JSON.stringify({ text: event.delta.text }) + "\n";
            controller.enqueue(encoder.encode(chunk));
          }
        }

        controller.enqueue(encoder.encode(JSON.stringify({ done: true }) + "\n"));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Anthropic.APIError
            ? `API xatosi: ${error.message}`
            : "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
        controller.enqueue(
          encoder.encode(JSON.stringify({ error: message }) + "\n")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
