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
    return {
      filename,
      mimeType,
      content: `[PDF Document: ${filename}]\n\nNote: PDF text extraction is not fully implemented. Please provide the text content or use a PDF with selectable text.`,
      error: "PDF extraction requires additional library. For now, please copy and paste the text content.",
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
    prompt += "\n\nAttached files:\n";
    fileContents.forEach((file, index) => {
      prompt += `\n--- File ${index + 1}: ${file.filename} ---\n`;
      if (file.error) {
        prompt += `[Note: ${file.error}]\n`;
      }
      if (file.content) {
        prompt += file.content;
      }
      prompt += "\n";
    });
  }

  return prompt;
}
