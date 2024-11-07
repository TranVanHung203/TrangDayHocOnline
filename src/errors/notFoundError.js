class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "Not Found"
  }
}

export default NotFoundError;
