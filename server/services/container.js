/**
 * Service Container
 * 
 * This file implements a simple dependency injection container for services.
 * It manages the creation and injection of dependencies for services.
 */

class ServiceContainer {
  constructor() {
    this.services = {};
    this.factories = {};
  }

  /**
   * Register a service factory function
   * @param {string} name - The name of the service
   * @param {Function} factory - Factory function that creates the service
   */
  register(name, factory) {
    this.factories[name] = factory;
  }

  /**
   * Get a service instance, creating it if it doesn't exist
   * @param {string} name - The name of the service to get
   * @returns {Object} The service instance
   */
  get(name) {
    // If the service is already instantiated, return it
    if (this.services[name]) {
      return this.services[name];
    }

    // Check if the factory exists
    const factory = this.factories[name];
    if (!factory) {
      throw new Error(`Service '${name}' not registered`);
    }

    // Create the service using the factory function
    // The factory can request other services from the container
    const service = factory(this);
    this.services[name] = service;
    return service;
  }

  /**
   * Clear all service instances but keep factories
   */
  clear() {
    this.services = {};
  }
}

// Create and export a singleton instance
const container = new ServiceContainer();

module.exports = container;