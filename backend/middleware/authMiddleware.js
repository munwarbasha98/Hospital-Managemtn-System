import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "carepoint_hospital_jwt_secret_key_2026";

/**
 * Middleware to verify JWT authentication token
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session token. Please log in again." });
  }
};

/**
 * Middleware to restrict endpoints based on user role
 * @param {string[]} allowedRoles Array of allowed roles, e.g. ['doctor', 'admin']
 */
export const verifyRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(", ")}]. Current role: '${req.user.role}'.`
      });
    }

    next();
  };
};

export { JWT_SECRET };
