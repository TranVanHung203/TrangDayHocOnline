import UnauthorizedError from "../errors/unauthorizedError.js";
import { User } from "../models/user.schema.js";
import jwtServices from "../utils/jwtServices.js";

const jwtMiddleware = async (req, res, next) => {
  try {
      req.user = {};
      req.user.id = "aa"
      req.user.role = "teacher"
      next()
  } catch (err) {
    return next(err); 
  }
};

export default jwtMiddleware;

