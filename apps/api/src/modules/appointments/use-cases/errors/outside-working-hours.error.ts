export class OutsideWorkingHoursError extends Error {
  constructor() {
    super('Appointment time is outside provider working hours.');
  }
}
