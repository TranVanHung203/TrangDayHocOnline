class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.statusCode = 400;
      this.name = "Bad Request"
    }
  }
  
  export default NotFoundError;