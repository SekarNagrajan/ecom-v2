// Created for Phase 8 — deterministic assistant conversations used by both the
// unit render test (DoD invariants) and the Playwright visual-regression spec.
//
// IDs are real values from the ai-service mock data (BKON260016, BKON7271,
// SIREQ260014) so screenshots match what the stubbed backend actually returns.
import type { ArchivedConversation } from "../store/assistant.store";
import type {
  AssistantCard,
  ChatMessage,
  MessageBlock,
  ToolRunState,
} from "../types/assistant.types";

/** Fixed clock so timestamps never make a screenshot flap. */
const TS = 1_700_000_000_000;

let seq = 0;
const bid = (kind: string) => `fix_${kind}_${(seq += 1)}`;

function user(text: string): ChatMessage {
  return {
    id: bid("u"),
    role: "user",
    text,
    createdAt: TS,
    status: "complete",
    citations: [],
    blocks: [{ type: "text", id: bid("ub"), text }],
    cards: [],
    tools: [],
  };
}

function assistant(blocks: MessageBlock[], tools: ToolRunState[] = []): ChatMessage {
  const text = blocks
    .filter((b): b is Extract<MessageBlock, { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();
  const cards = blocks
    .filter((b): b is Extract<MessageBlock, { type: "card" }> => b.type === "card")
    .map((b) => b.card);
  return {
    id: bid("a"),
    role: "assistant",
    text,
    createdAt: TS,
    status: "complete",
    citations: [],
    blocks,
    cards,
    tools,
  };
}

const textBlock = (text: string): MessageBlock => ({
  type: "text",
  id: bid("t"),
  text,
});

const toolBlock = (callId: string): MessageBlock => ({
  type: "tool",
  id: bid("tool"),
  callId,
});

function cardBlock(card: Omit<AssistantCard, "callId" | "arguments">): MessageBlock {
  return {
    type: "card",
    id: bid("c"),
    card: { callId: bid("call"), arguments: {}, ...card },
  };
}

export interface AssistantFixture {
  /** Stable slug used in screenshot file names. */
  key: string;
  title: string;
  messages: ChatMessage[];
}

/** 1. Plain prose answer, no tools or cards. */
const plainAnswer: AssistantFixture = {
  key: "plain-answer",
  title: "What does VGM mean?",
  messages: [
    user("What does VGM mean?"),
    assistant([
      textBlock(
        "VGM stands for Verified Gross Mass — the total weight of a packed " +
          "container including its cargo, dunnage and tare. It must be declared " +
          "before the vessel's VGM cut-off or the box cannot be loaded.",
      ),
    ]),
  ],
};

/** 2. Prose answer that contains a Markdown table. */
const answerWithTable: AssistantFixture = {
  key: "answer-with-table",
  title: "Summarise my two latest bookings",
  messages: [
    user("Summarise my two latest bookings"),
    assistant([
      textBlock(
        "Here are your two most recent bookings:\n\n" +
          "| Booking | Route | Status |\n" +
          "| --- | --- | --- |\n" +
          "| BKON260016 | Chennai → Rotterdam | Confirmed |\n" +
          "| BKON7271 | Singapore → Rotterdam | Awaiting Acceptance |",
      ),
    ]),
  ],
};

/** 3. Multi-round: text → tool → card → text. */
const multiRound: AssistantFixture = {
  key: "multi-round",
  title: "Show my active bookings",
  messages: [
    user("Show my active bookings"),
    assistant(
      [
        textBlock("Let me pull up your bookings."),
        toolBlock("c_bookings"),
        cardBlock({
          kind: "tool_result",
          name: "list_bookings",
          ok: true,
          data: {
            total: 2,
            returned: 2,
            truncated: false,
            items: [
              {
                id: "BKON260016",
                bookingNo: "BKON260016",
                status: "Confirmed",
                origin: "Chennai",
                delivery: "Rotterdam",
              },
              {
                id: "BKON7271",
                bookingNo: "BKON7271",
                status: "Awaiting Acceptance",
                origin: "Singapore",
                delivery: "Rotterdam",
              },
            ],
          },
        }),
        textBlock(
          "You have 2 active bookings — BKON260016 is confirmed and BKON7271 " +
            "is still awaiting carrier acceptance.",
        ),
      ],
      [{ callId: "c_bookings", tool: "list_bookings", status: "done" }],
    ),
  ],
};

/** 4. Container tracking. */
const tracking: AssistantFixture = {
  key: "tracking",
  title: "Track SMLU8829102",
  messages: [
    user("Track SMLU8829102"),
    assistant(
      [
        textBlock("Here is the latest status for that container."),
        toolBlock("c_track"),
        cardBlock({
          kind: "tool_result",
          name: "track_shipment",
          ok: true,
          data: {
            found: true,
            bookingNo: "BKON260016",
            vessel: "MAERSK CHENNAI",
            voyage: "123W",
            pol: "INMAA",
            pod: "NLRTM",
            containers: [
              {
                containerNo: "SMLU8829102",
                status: "In Transit",
                lastLocation: "Suez Canal",
                latestActivity: "Vessel departed Jebel Ali",
              },
            ],
          },
        }),
      ],
      [{ callId: "c_track", tool: "track_shipment", status: "done" }],
    ),
  ],
};

/** 5. Schedule list. */
const scheduleList: AssistantFixture = {
  key: "schedule-list",
  title: "Sailings from Chennai to Rotterdam",
  messages: [
    user("Sailings from Chennai to Rotterdam"),
    assistant(
      [
        textBlock("I found a few upcoming sailings on that lane."),
        toolBlock("c_sched"),
        cardBlock({
          kind: "tool_result",
          name: "search_schedules",
          ok: true,
          data: {
            count: 3,
            sailings: [
              {
                id: "SCH1",
                vessel: "MAERSK CHENNAI",
                voyage: "123W",
                pol: "INMAA",
                pod: "NLRTM",
                etd: "2026-11-02",
                eta: "2026-11-24",
                transitTimeDays: 22,
                bookingAllowed: true,
                isDefaultRoute: true,
              },
              {
                id: "SCH2",
                vessel: "MSC ISTANBUL",
                voyage: "445E",
                pol: "INMAA",
                pod: "NLRTM",
                etd: "2026-11-05",
                eta: "2026-11-29",
                transitTimeDays: 24,
                bookingAllowed: true,
              },
              {
                id: "SCH3",
                vessel: "CMA CGM NILE",
                voyage: "778W",
                pol: "INMAA",
                pod: "NLRTM",
                etd: "2026-11-09",
                eta: "2026-12-04",
                transitTimeDays: 25,
                bookingAllowed: false,
              },
            ],
          },
        }),
      ],
      [{ callId: "c_sched", tool: "search_schedules", status: "done" }],
    ),
  ],
};

/** 6. Failed tool — translated warning, never a raw error code. */
const failedTool: AssistantFixture = {
  key: "failed-tool",
  title: "Open shipping instruction SIREQ260014",
  messages: [
    user("Open shipping instruction SIREQ260014"),
    assistant(
      [
        textBlock("I couldn't open that shipping instruction."),
        toolBlock("c_si"),
        cardBlock({
          kind: "tool_result",
          name: "get_booking",
          ok: false,
          error: "FORBIDDEN: capability SI not granted",
          data: {},
        }),
      ],
      [{ callId: "c_si", tool: "get_booking", status: "failed" }],
    ),
  ],
};

/** 7. Long Chinese answer — stresses CJK wrapping and the log region. */
const longZh: AssistantFixture = {
  key: "long-zh",
  title: "请详细说明提单的签发流程",
  messages: [
    user("请详细说明提单的签发流程"),
    assistant([
      textBlock(
        "提单（Bill of Lading）的签发通常分为以下几个步骤：首先，托运人在装货港提交" +
          "装运须知（Shipping Instruction），确认收货人、通知方、货物描述、唛头以及" +
          "运费条款等信息。承运人核对订舱（例如 BKON260016）与实际装船数据无误后，" +
          "生成提单草稿供托运人校对。校对无误并完成 VGM 申报与放行后，承运人即可签发" +
          "正本提单或电放提单。若选择电放，则无需寄送正本，收货人可凭身份在目的港办理" +
          "提货；若签发正本，则需凭正本提单换取提货单（Delivery Order）方可提货。",
      ),
    ]),
  ],
};

export const ASSISTANT_FIXTURES: AssistantFixture[] = [
  plainAnswer,
  answerWithTable,
  multiRound,
  tracking,
  scheduleList,
  failedTool,
  longZh,
];

/** Wrap a fixture as a persisted archive entry so the store can resume it. */
export function fixtureToArchive(fixture: AssistantFixture): ArchivedConversation {
  return {
    id: `arch_fix_${fixture.key}`,
    conversationId: `conv_fix_${fixture.key}`,
    title: fixture.title,
    messages: fixture.messages,
    updatedAt: TS,
    mode: "assistant",
  };
}
