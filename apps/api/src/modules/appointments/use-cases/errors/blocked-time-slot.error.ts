export class BlockedTimeSlotError extends Error {
  constructor() {
    super('Provider has a blocked time slot during the requested time.');
  }
}
