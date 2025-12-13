/**
 * Kestra Configuration
 * 
 * This configuration is used for Kestra workflow integration.
 * Environment variables are loaded from .env.local (dev) or Vercel (production).
 */

export const KESTRA_CONFIG = {
  /**
   * Kestra instance URL
   * - Development: http://localhost:8080
   * - Production: Your Kestra Cloud URL or self-hosted URL
   */
  url: process.env.KESTRA_URL || "http://localhost:8080",

  /**
   * Kestra authentication (Base64 encoded username:password)
   * Only needed for status checks via API, not for webhooks
   * Optional - webhooks don't require authentication
   */
  auth: process.env.KESTRA_AUTH || undefined,

  /**
   * Namespace for workflows
   */
  namespace: "civiclens",

  /**
   * Workflow IDs
   */
  workflows: {
    weeklySchemeUpdates: "weekly-scheme-updates",
    eligibilityExtractor: "eligibility-rule-extractor",
    autocompleteSuggestions: "autocomplete-suggestions",
  },

  /**
   * Webhook keys for each workflow
   */
  webhookKeys: {
    weeklySchemeUpdates: "weekly-scheme-updates-key",
    eligibilityExtractor: "eligibility-extractor-key",
    autocompleteSuggestions: "autocomplete-suggestions-key",
  },

  /**
   * Get webhook URL for a workflow
   */
  getWebhookUrl(workflowId: string, webhookKey: string): string {
    return `${this.url}/api/v1/executions/webhook/${this.namespace}/${workflowId}/${webhookKey}`;
  },

  /**
   * Check if Kestra is configured
   */
  isConfigured(): boolean {
    return !!this.url && this.url !== "http://localhost:8080" || process.env.NODE_ENV === "development";
  },
} as const;
