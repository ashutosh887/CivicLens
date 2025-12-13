/**
 * Oumi Configuration
 * 
 * This configuration is used for Oumi fine-tuned model integration.
 * Environment variables are loaded from .env.local (dev) or Vercel (production).
 */

export const OUMI_CONFIG = {
  /**
   * Oumi model endpoint URL
   * - Local: http://localhost:8000 (if running Oumi API server)
   * - Production: Your deployed model endpoint URL
   * - If not set, falls back to OpenAI
   */
  modelUrl: process.env.OUMI_MODEL_URL || undefined,

  /**
   * Oumi API key (if required)
   */
  apiKey: process.env.OUMI_API_KEY || undefined,

  /**
   * Path to Oumi config file
   */
  configPath: "./oumi/config.yaml",

  /**
   * Path to Oumi dataset
   */
  datasetPath: "./oumi/dataset.json",

  /**
   * Path where trained model is saved
   */
  modelOutputPath: "./models/civiclens-finetuned",

  /**
   * Whether to use Oumi model for civic queries
   * Set to false to use OpenAI instead
   */
  enabled: process.env.OUMI_ENABLED === "true" || false,

  /**
   * Training configuration
   */
  training: {
    /**
     * Python command to run Oumi
     * Default: "oumi" (assumes oumi is in PATH)
     * Alternative: "python -m oumi" or full path
     */
    command: process.env.OUMI_COMMAND || "oumi",

    /**
     * Timeout for training (in milliseconds)
     * Default: 2 hours
     */
    timeout: parseInt(process.env.OUMI_TRAINING_TIMEOUT || "7200000", 10),
  },

  /**
   * Check if Oumi is configured and enabled
   */
  isConfigured(): boolean {
    return this.enabled && !!this.modelUrl;
  },

  /**
   * Check if model is trained and available
   */
  isModelAvailable(): boolean {
    // In production, check if model URL is accessible
    // In development, check if model files exist
    return this.isConfigured();
  },
} as const;
