import { prisma } from "@/lib/prisma";

export interface FileContent {
  filename: string;
  mimeType: string;
  content: string;
  error?: string;
}

export async function extractFileContent(fileId: string): Promise<FileContent | null> {
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return null;
    }

    let fileBuffer: Buffer;
    if (file.storageType === "mongodb" && file.data) {
      fileBuffer = Buffer.from(file.data, "base64");
    } else {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: "",
        error: "File storage type not supported for extraction",
      };
    }

    if (file.mimeType === "application/pdf") {
      return await extractPDFContent(fileBuffer, file.originalName, file.mimeType);
    } else if (file.mimeType.startsWith("text/")) {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: fileBuffer.toString("utf-8"),
      };
    } else if (
      file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimeType === "application/msword"
    ) {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: `[Word Document: ${file.originalName}]`,
        error: "Word document extraction not yet implemented. Please provide text content.",
      };
    } else if (file.mimeType.startsWith("image/")) {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: `[Image: ${file.originalName}]`,
        error: "Image content extraction requires vision API. Please describe the image in your message.",
      };
    } else {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: `[File: ${file.originalName}]`,
        error: "File type not supported for text extraction",
      };
    }
  } catch (error: any) {
    console.error("Error extracting file content:", error);
    return {
      filename: "unknown",
      mimeType: "unknown",
      content: "",
      error: error.message || "Failed to extract file content",
    };
  }
}

async function extractPDFContent(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<FileContent> {
  try {
    let pdfText = "";
    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const pdfParseModule = await dynamicImport('pdf-parse').catch(() => null);
      if (pdfParseModule && pdfParseModule.default) {
        const pdfData = await pdfParseModule.default(buffer);
        pdfText = pdfData.text;
      }
    } catch (importError) {
      // pdf-parse not available
    }

    if (pdfText && pdfText.trim().length > 0) {
      return {
        filename,
        mimeType,
        content: pdfText,
      };
    }

    const bufferString = buffer.toString("utf-8", 0, Math.min(buffer.length, 100000));
    const textMatches = bufferString.match(/\(([^)]+)\)/g);
    if (textMatches && textMatches.length > 10) {
      const extractedText = textMatches
        .map(m => m.slice(1, -1))
        .filter(t => t.length > 2 && !t.match(/^[\d\s]+$/))
        .join(" ")
        .substring(0, 5000);
      
      if (extractedText.length > 50) {
        return {
          filename,
          mimeType,
          content: extractedText + "\n\n[Note: This is a partial extraction. For full content, please ensure the PDF has selectable text.]",
        };
      }
    }

    return {
      filename,
      mimeType,
      content: `[PDF Document: ${filename}]\n\nThe PDF file has been received. However, automatic text extraction from this PDF is limited. If you have questions about the document, please:\n1. Copy and paste the relevant text from the PDF\n2. Or describe what you need help with regarding this document\n\nI can help you understand, analyze, or answer questions about the content once you provide the text.`,
      error: "PDF text extraction is limited. Please provide the text content or describe what you need help with.",
    };
  } catch (error: any) {
    return {
      filename,
      mimeType,
      content: "",
      error: error.message || "Failed to extract PDF content",
    };
  }
}

export async function extractMultipleFileContents(
  fileIds: string[]
): Promise<FileContent[]> {
  const results = await Promise.all(
    fileIds.map((id) => extractFileContent(id))
  );
  return results.filter((result): result is FileContent => result !== null);
}

export function formatFileContentsForPrompt(
  fileContents: FileContent[],
  userQuery: string
): string {
  if (fileContents.length === 0) {
    return userQuery;
  }

  let prompt = userQuery || "Please analyze the attached file(s).";

  if (fileContents.length > 0) {
    prompt += "\n\n=== ATTACHED FILES ===\n";
    fileContents.forEach((file, index) => {
      prompt += `\n--- File ${index + 1}: ${file.filename} (${file.mimeType}) ---\n`;
      
      if (file.error && (!file.content || file.content.trim().length === 0)) {
        prompt += `[Note: ${file.error}]\n`;
        prompt += `The user has attached this file but automatic extraction is limited. Please acknowledge the file and ask the user to provide the text content or describe what they need help with regarding this file.\n`;
      } else if (file.content && file.content.trim().length > 0) {
        prompt += file.content;
        if (file.error) {
          prompt += `\n[Note: ${file.error}]\n`;
        }
      } else {
        prompt += `[File received but content could not be extracted]\n`;
      }
      prompt += "\n";
    });
    prompt += "\n=== END OF ATTACHED FILES ===\n\n";
    prompt += "Please analyze the file(s) above and respond to the user's query. If the file content is not fully extracted, acknowledge the file and ask for clarification or the text content.";
  }

  return prompt;
}
