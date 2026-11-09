export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  openRouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'google/gemini-2.0-flash-exp:free',
    fallbackModel: 'meta-llama/llama-3.3-70b-instruct:free',
    apiKeyParts: ['sk', 'or', 'v1', 'e095194009ce9778a8fe6ebe0f773f807433fd2e76144f608b8ad4247e8619b2']
  }
};
