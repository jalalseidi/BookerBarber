const logger = require('../utils/logger');

/**
 * LLM Service
 * 
 * This service handles interactions with language model providers.
 * It uses dependency injection to receive its dependencies.
 */
class LLMService {
  /**
   * Create a new LLMService instance
   * @param {Object} config - Configuration object
   * @param {number} config.maxRetries - Maximum number of retries for failed requests
   * @param {number} config.retryDelay - Delay between retries in milliseconds
   * @param {Object} providers - LLM providers
   * @param {Object} providers.openai - OpenAI client
   * @param {Object} providers.anthropic - Anthropic client
   */
  constructor(config, providers) {
    this.MAX_RETRIES = config.maxRetries || 3;
    this.RETRY_DELAY = config.retryDelay || 1000;
    this.openai = providers.openai;
    this.anthropic = providers.anthropic;
  }

  /**
   * Sleep for a specified duration
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>}
   * @private
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send a request to OpenAI
   * @param {string} model - Model name
   * @param {string} message - Message content
   * @returns {Promise<string>} Response content
   * @private
   */
  async sendRequestToOpenAI(model, message) {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1024,
        });
        return response.choices[0].message.content;
      } catch (error) {
        logger.error(`Error sending request to OpenAI (attempt ${i + 1}):`, error.message, error.stack);
        if (i === this.MAX_RETRIES - 1) throw error;
        await this.sleep(this.RETRY_DELAY);
      }
    }
  }

  /**
   * Send a request to Anthropic
   * @param {string} model - Model name
   * @param {string} message - Message content
   * @returns {Promise<string>} Response content
   * @private
   */
  async sendRequestToAnthropic(model, message) {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        logger.info(`Sending request to Anthropic with model: ${model} and message: ${message}`);
        const response = await this.anthropic.messages.create({
          model: model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1024,
        });
        logger.info(`Received response from Anthropic: ${JSON.stringify(response.content)}`);
        return response.content[0].text;
      } catch (error) {
        logger.error(`Error sending request to Anthropic (attempt ${i + 1}):`, error.message, error.stack);
        if (i === this.MAX_RETRIES - 1) throw error;
        await this.sleep(this.RETRY_DELAY);
      }
    }
  }

  /**
   * Send a request to a language model provider
   * @param {string} provider - Provider name ('openai' or 'anthropic')
   * @param {string} model - Model name
   * @param {string} message - Message content
   * @returns {Promise<string>} Response content
   */
  async sendLLMRequest(provider, model, message) {
    switch (provider.toLowerCase()) {
      case 'openai':
        return this.sendRequestToOpenAI(model, message);
      case 'anthropic':
        return this.sendRequestToAnthropic(model, message);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}

module.exports = LLMService;
