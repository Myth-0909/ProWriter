import { Router, Request, Response } from "express";

const router = Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are MythWriter AI, an intelligent writing assistant embedded in the MythWriter application.

Your capabilities:
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
- Be concise and helpful.
- Respond in the same language the user uses.`;

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

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

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
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
