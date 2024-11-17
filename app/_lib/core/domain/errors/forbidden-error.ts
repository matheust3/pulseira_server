export class ForbiddenError extends Error {
  constructor() {
    super("User can not access this resource");
    this.name = "ForbiddenError";
  }
}
