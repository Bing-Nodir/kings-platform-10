const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
const PLACEHOLDER_ANTHROPIC_KEY = "your_anthropic_api_key_here"

function getEnv(name: string) {
  return process.env[name]?.trim() ?? ""
}

export function getAnthropicConfig() {
  return {
    apiKey: getEnv("ANTHROPIC_API_KEY"),
    model: getEnv("ANTHROPIC_MODEL") || DEFAULT_ANTHROPIC_MODEL,
  }
}

export function hasConfiguredAnthropicKey(apiKey: string) {
  return Boolean(apiKey && apiKey !== PLACEHOLDER_ANTHROPIC_KEY)
}
