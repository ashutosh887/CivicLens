export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024,
  maxSizeMB: 10,
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ],
  acceptedExtensions: ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png",
  gridfsThreshold: 16 * 1024 * 1024,
  storageTypes: {
    mongodb: "mongodb",
    gridfs: "gridfs",
  },
} as const;

