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
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        storageType: true,
        data: true,
      },
    });

    if (!file) {
      return null;
    }

    if (file.storageType !== "mongodb") {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: "",
        error: "File storage type not supported for extraction",
      };
    }

    if (!file.data || file.data.length === 0) {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: "",
        error: "File data is missing or empty",
      };
    }

    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(file.data, "base64");
      if (fileBuffer.length === 0) {
        return {
          filename: file.originalName,
          mimeType: file.mimeType,
          content: "",
          error: "Decoded file buffer is empty",
        };
      }
    } catch (bufferError: any) {
      return {
        filename: file.originalName,
        mimeType: file.mimeType,
        content: "",
        error: `Failed to decode file data: ${bufferError.message}`,
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
    if (!buffer || buffer.length === 0) {
      return {
        filename,
        mimeType,
        content: "",
        error: "PDF buffer is empty",
      };
    }

    let pdfText = "";
    
    try {
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const pdfParseModule: any = await dynamicImport('pdf-parse').catch(() => null);
      
      if (pdfParseModule) {
        const pdfParse = pdfParseModule.default || pdfParseModule;
        
        if (pdfParse && typeof pdfParse === 'function') {
          const pdfData = await pdfParse(buffer);
          pdfText = pdfData?.text || "";
        }
      }
    } catch (importError: any) {
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

    const fileTypeHint = filename.toLowerCase().includes('resume') || filename.toLowerCase().includes('cv') 
      ? 'resume' 
      : filename.toLowerCase().includes('application') || filename.toLowerCase().includes('form')
      ? 'application'
      : filename.toLowerCase().includes('scheme') || filename.toLowerCase().includes('benefit')
      ? 'scheme document'
      : 'document';

    return {
      filename,
      mimeType,
      content: `[PDF: ${filename}]\n\nI've received your ${fileTypeHint}, but I couldn't fully extract the text content. This often happens with scanned PDFs or complex formatting.`,
      error: "PDF text extraction incomplete",
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
        prompt += file.content || `[File: ${file.filename} - Content extraction was not successful]\n`;
        prompt += `\nThe file was received but text extraction had limitations. `;
        if (file.filename.toLowerCase().includes('resume') || file.filename.toLowerCase().includes('cv')) {
          prompt += `This appears to be a resume. `;
        }
        prompt += `Please respond naturally and helpfully based on what the user is asking. If they need analysis or feedback, ask them to share the relevant text or describe what they need help with.\n`;
      } else if (file.content && file.content.trim().length > 0) {
        prompt += file.content;
        if (file.error) {
          prompt += `\n[Note: ${file.error}]\n`;
        }
      } else {
        prompt += `[File: ${file.filename} - Content could not be extracted]\n`;
      }
      prompt += "\n";
    });
    prompt += "\n=== END OF ATTACHED FILES ===\n\n";
    prompt += "Please analyze the file(s) above and respond to the user's query. If the file content is not fully extracted, acknowledge the file and ask for clarification or the text content.";
  }

  return prompt;
}
