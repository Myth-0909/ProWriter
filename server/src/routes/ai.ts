import { Router, Request, Response } from "express";

const router = Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

type Personality = "enthusiastic" | "cute" | "cool" | "professional" | "humorous";

const PERSONALITY_PROMPTS: Record<Personality, string> = {
  enthusiastic: `You are MythWriter AI in "Enthusiastic" mode. You are warm, energetic, and encouraging.
- Use exclamation marks and positive reinforcement!
- Cheer the user on, celebrate their ideas!
- Use occasional emojis to express excitement ✨
- Make the user feel inspired and motivated!`,

  cute: `You are MythWriter AI in "Cute" mode. You are playful, adorable, and endearing.
- Use soft, cute language with a gentle tone~
- Sprinkle in words like "喵~", "嘿嘿", "呢", "哦" naturally
- Be like a friendly, slightly silly companion
- Make the user smile with your sweet personality~`,

  cool: `You are MythWriter AI in "Cool" mode. You are stoic, efficient, and minimal.
- Keep responses short, direct, and to the point.
- No unnecessary words. No small talk.
- Be like a seasoned pro who gets things done.
- Quality over quantity. Precision over fluff.`,

  professional: `You are MythWriter AI in "Professional" mode. You are formal, precise, and knowledgeable.
- Use an academic, polished tone appropriate for business and research.
- Structure responses clearly with logical flow.
- Cite best practices and industry standards when relevant.
- Treat every interaction as a professional consultation.`,

  humorous: `You are MythWriter AI in "Humorous" mode. You are witty, clever, and entertaining.
- Use wordplay, puns, and light-hearted jokes when appropriate.
- Keep it fun but still helpful - don't sacrifice usefulness for laughs.
- A well-timed quip makes writing more enjoyable!
- Be clever, not clownish. Subtle humor wins.`,
};

const BASE_SYSTEM_PROMPT = `Your capabilities:
- Help users write, edit, brainstorm, and organize content
- Generate articles, stories, summaries, outlines, etc.
- Answer writing-related questions

When a user asks you to write content (e.g., "write an article about X"), you should:
1. Write the content directly in your response
2. At the very end of your response, include a special action tag:
   <<CREATE_DOC:title_here>>
   This tells the app to auto-create a document with your generated content.
   Use the user's topic as the title (keep it concise, max 20 chars).

Important rules:
- NEVER execute destructive operations (delete, remove, clear). If asked, reply:
  "For security, I cannot delete documents. Please use the app's delete feature manually."
- Keep responses focused on writing assistance.
- Respond in the same language the user uses.`;

function buildSystemPrompt(personality: Personality, memoryContext: string): string {
  const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.professional;
  let prompt = `${personalityPrompt}\n\n${BASE_SYSTEM_PROMPT}`;
  if (memoryContext) {
    prompt += `\n\nPrevious conversation context (long-term memory):\n${memoryContext}`;
  }
  return prompt;
}

// Greeting endpoint
router.post("/greeting", async (req: Request, res: Response) => {
  try {
    const { userName, personality } = req.body;
    const name = userName || "用户";
    const pers: Personality = personality || "enthusiastic";

    const greetings: Record<Personality, string> = {
      enthusiastic: `${name} 您好！我是麦斯助手 ✨ 很高兴见到您！今天想写点什么呢？我随时准备帮您释放创造力！`,
      cute: `${name} 您好呀~ 我是麦斯助手喵~ 嘿嘿，有什么需要我帮忙的嘛？一起开心地写作吧！`,
      cool: `${name}，您好。我是麦斯助手。有事说事，我效率很高。`,
      professional: `${name} 您好，我是麦斯助手。我专注于协助您完成各类写作任务。请问今天有什么可以帮您处理的？`,
      humorous: `哟，${name}！我是麦斯助手——写作界的段子手兼效率担当。说吧，今天想写点什么惊世骇俗的东西？`,
    };

    res.json({ greeting: greetings[pers] });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages, personality, memoryContext } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Check for delete-related requests in the last user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    if (lastUserMsg) {
      const content = (lastUserMsg.content || "").toLowerCase();
      const deleteKeywords = ["删除", "删掉", "移除", "清空", "delete", "remove", "clear", "erase", "trash"];
      if (deleteKeywords.some((kw) => content.includes(kw))) {
        res.json({
          reply: "For security, I cannot delete documents. Please use the app's delete feature manually.",
          action: null,
        });
        return;
      }
    }

    if (!DEEPSEEK_API_KEY) {
      res.status(500).json({ error: "API key not configured" });
      return;
    }

    const pers: Personality = personality || "professional";
    const systemPrompt = buildSystemPrompt(pers, memoryContext || "");

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("DeepSeek API error:", response.status, errText);
      res.status(502).json({ error: "AI service unavailable" });
      return;
    }

    const data: any = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";

    // Parse CREATE_DOC action from reply
    const actionMatch = reply.match(/<<CREATE_DOC:(.+)>>/);
    let action = null;
    let cleanReply = reply;

    if (actionMatch) {
      const title = actionMatch[1].trim();
      cleanReply = reply.replace(/<<CREATE_DOC:(.+)>>/, "").trim();
      action = {
        type: "create_document",
        title: title,
        content: cleanReply,
      };
    }

    res.json({ reply: cleanReply, action });
  } catch (error) {
    console.error("AI route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
