import type {
  ActivityType,
  BusinessHoursConfig,
  RepeatOption,
  TaskPriority,
  TaskStatus,
} from "./calendar-types";

// Activity Task priority colors (matching Ant Design semantic colors)
export const PRIORITY_COLORS = {
  high: "#ff4d4f", // Ant Design error color
  medium: "#faad14", // Ant Design warning color
  low: "#047857", // Ant Design success color
} as const;

// Default business hours configuration
export const DEFAULT_BUSINESS_HOURS: BusinessHoursConfig = {
  daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
  startTime: "09:00",
  endTime: "17:00",
};

// Calendar view options
export const CALENDAR_VIEWS = {
  month: "dayGridMonth",
  week: "timeGridWeek",
  day: "timeGridDay",
  list: "listWeek",
} as const;

// Repeat options
export const REPEAT_OPTIONS = [
  { label: "Does not repeat", value: "no-repeat" as RepeatOption },
  { label: "Daily", value: "daily" as RepeatOption },
  { label: "Weekly", value: "weekly" as RepeatOption },
  { label: "Monthly", value: "monthly" as RepeatOption },
];

// Priority options for Activity Tasks
export const PRIORITY_OPTIONS = [
  { label: "High", value: "high" as TaskPriority, color: PRIORITY_COLORS.high },
  {
    label: "Medium",
    value: "medium" as TaskPriority,
    color: PRIORITY_COLORS.medium,
  },
  { label: "Low", value: "low" as TaskPriority, color: PRIORITY_COLORS.low },
];

// Status options for Activity Tasks
export const STATUS_OPTIONS = [
  { label: "Open", value: "open" as TaskStatus },
  { label: "In Progress", value: "in-progress" as TaskStatus },
  { label: "Negotiation", value: "negotiation" as TaskStatus },
  { label: "Review", value: "review" as TaskStatus },
  { label: "Closed", value: "closed" as TaskStatus },
];

// Filter options
export const FILTER_OPTIONS = [
  { label: "All Events", value: "all" },
  { label: "Teams Meetings", value: "teams-meeting" },
  { label: "Activity Tasks", value: "activity-task" },
];

export const ACTIVITY_TYPE_OPTIONS = [
  { label: "Call", value: "call" as ActivityType },
  { label: "Activity", value: "activity" as ActivityType },
  { label: "Meeting", value: "meeting" as ActivityType },
  { label: "Visit", value: "visit" as ActivityType },
];

// Calendar event type display names
export const EVENT_TYPE_LABELS = {
  "teams-meeting": "Teams Meeting",
  "activity-task": "Activity Task",
} as const;

// Default calendar height
export const DEFAULT_CALENDAR_HEIGHT = "auto";

// Mock data for testing
export const MOCK_ASSIGNEES = [
  { value: "1", label: "John Doe", email: "john@example.com" },
  { value: "2", label: "Jane Smith", email: "jane@example.com" },
  { value: "3", label: "Bob Johnson", email: "bob@example.com" },
  { value: "4", label: "Alice Brown", email: "alice@example.com" },
  { value: "5", label: "Charlie Wilson", email: "charlie@example.com" },
];

export const MOCK_CUSTOMERS = [
  { value: "1", label: "Acme Corporation" },
  { value: "2", label: "Beta Industries" },
  { value: "3", label: "Gamma Technologies" },
  { value: "4", label: "Delta Solutions" },
  { value: "5", label: "Epsilon Services" },
];
