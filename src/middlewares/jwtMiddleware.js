// import UnauthorizedError from "../errors/unauthorizedError.js";
// import { User } from "../models/user.schema.js";
// import jwtServices from "../utils/jwtServices.js";

const jwtMiddleware = async (req, res, next) => {
  try {
    req.user = {};
    req.user.id = "67273ac30214a78b1f587b9b"
    req.user.role = "Lecturer"
    next()
  } catch (err) {
    return next(err);
  }
};

export default jwtMiddleware;

