import { CHAT_CONFIG } from "@/config/chat";

export function generateChatTitle(userMessage: string): string {
  const message = userMessage.trim();
  
  if (message.length <= CHAT_CONFIG.maxTitleLength) {
    return message;
  }

  const lowerMessage = message.toLowerCase();
  
  const commonWords = new Set([
    "what", "is", "the", "a", "an", "how", "do", "i", "can", "you", "for", "to", "of", "in", "on", "at", "by", "with", "about", "and", "or", "but", "if", "when", "where", "why", "which", "who", "whom", "whose", "this", "that", "these", "those", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "will", "would", "should", "could", "may", "might", "must", "shall", "can", "cannot"
  ]);

  const words = message.split(/\s+/).filter(word => {
    const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
    return cleanWord.length > 2 && !commonWords.has(cleanWord);
  });

  if (words.length === 0) {
    return message.slice(0, CHAT_CONFIG.maxTitleLength) + "...";
  }

  let title = "";
  for (const word of words) {
    if (title.length + word.length + 1 <= CHAT_CONFIG.maxTitleLength) {
      title += (title ? " " : "") + word;
    } else {
      break;
    }
  }

  if (title.length === 0) {
    title = message.slice(0, CHAT_CONFIG.maxTitleLength);
  }

  if (title.length < message.length) {
    title += "...";
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return capitalizeFirst(title);
}

