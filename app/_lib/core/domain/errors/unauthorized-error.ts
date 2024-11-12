export class UnauthorizedError extends Error {
  constructor() {
    super("User can not access this resource");
    this.name = "UnauthorizedError";
  }
}
