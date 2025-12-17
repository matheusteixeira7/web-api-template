export class ProviderNotAvailableError extends Error {
  constructor() {
    super('Provider is not available at the requested time.');
  }
}
