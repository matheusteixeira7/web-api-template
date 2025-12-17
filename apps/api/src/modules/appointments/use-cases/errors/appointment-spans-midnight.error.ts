export class AppointmentSpansMidnightError extends Error {
  constructor() {
    super('Appointments cannot span midnight.');
  }
}
