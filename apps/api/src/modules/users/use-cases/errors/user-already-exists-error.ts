/**
 * Error thrown when attempting to create a user with an email that already exists.
 *
 * @extends Error
 */
export class UserAlreadyExistsError extends Error {
  constructor() {
    super('E-mail already exists.');
  }
}
