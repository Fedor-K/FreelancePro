// Configuration settings

export const WEBHOOK_API_KEYS = {
  // Default secure API key for demonstration
  // In production, this should be stored in environment variables
  default: "freelanly-api-key-01",
  // You can add additional API keys for different integrations
  // Example: "integration1": "key1",
  // Example: "integration2": "key2",
};

export const isValidApiKey = (apiKey: string): boolean => {
  // Check if the provided API key exists in our valid keys list
  return Object.values(WEBHOOK_API_KEYS).includes(apiKey);
};

export const getApiKeySource = (apiKey: string): string | null => {
  // Find the source that corresponds to this API key
  const entries = Object.entries(WEBHOOK_API_KEYS);
  const match = entries.find(([_, value]) => value === apiKey);
  return match ? match[0] : null;
};
