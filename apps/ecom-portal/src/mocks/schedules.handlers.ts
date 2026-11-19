// Modified by Sekar Nagarajan (2026-09-15 15:00)
import { http, HttpResponse } from "msw";

export const schedulesHandlers = [
  http.post("/api/v1/schedules/share-mail", async ({ request }) => {
    const input = (await request.json()) as {
      to: string;
      cc?: string;
      subject: string;
      message: string;
      schedules?: unknown[];
    };
    if (
      !input?.to?.trim() ||
      !input?.subject?.trim() ||
      !input?.message?.trim()
    ) {
      return HttpResponse.json(
        {
          success: false,
          message: "Recipient, subject, and message are required.",
        },
        { status: 400 },
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 450));
    const recipients = [input.to, ...(input.cc ? input.cc.split(/[;,]/) : [])]
      .map((v) => v.trim())
      .filter(Boolean);
    return HttpResponse.json({
      success: true,
      data: {
        success: true,
        messageId: `sch-mail-${Date.now()}`,
        recipientCount: recipients.length,
      },
    });
  }),
];
