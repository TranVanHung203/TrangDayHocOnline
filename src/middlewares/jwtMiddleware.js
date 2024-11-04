


const jwtMiddleware = async (req, res, next) => {
  try {
      req.user = {};
      req.user.id = "67285d33a6ab2a9f4a03d9b2"
      req.user.role = "Lecturer"
      next()
  } catch (err) {
    return next(err); 
  }
};

export default jwtMiddleware;
