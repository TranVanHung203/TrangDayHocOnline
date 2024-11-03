


const jwtMiddleware = async (req, res, next) => {
  try {
      req.user = {};
      req.user.id = "672703041cb56f099b77d6e0"
      req.user.role = "Lecturer"
      next()
  } catch (err) {
    return next(err); 
  }
};

export default jwtMiddleware;
