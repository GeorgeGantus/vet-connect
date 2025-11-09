/**
 * Middleware to check if a user has one of the allowed roles.
 * @param {string[]} allowedRoles - An array of role strings that are permitted.
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (userRole && allowedRoles.includes(userRole)) {
      next(); // User has the required role, proceed.
    } else {
      res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
    }
  };
};

module.exports = authorize;