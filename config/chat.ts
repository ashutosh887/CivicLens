export const CHAT_CONFIG = {
  sampleQueries: [
    {
      text: "What is PM-KISAN scheme and how do I apply?",
      category: "Scheme Info",
    },
    {
      text: "Generate an RTI application for property records",
      category: "Document",
    },
    {
      text: "Explain eligibility for SNAP benefits in the USA",
      category: "Eligibility",
    },
    {
      text: "Create a complaint letter about potholes in my area",
      category: "Complaint",
    },
    {
      text: "What documents are needed for passport application?",
      category: "Documents",
    },
    {
      text: "How to apply for unemployment benefits?",
      category: "Application",
    },
  ],
  conversationHistoryLimit: 10,
  messageHistoryLimit: 20,
  defaultChatTitle: "New Chat",
  maxTitleLength: 50,
} as const;

