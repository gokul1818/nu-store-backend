exports.requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (req.user.role === 'admin' || req.user.email === process.env.ADMIN_EMAIL) return next();
  return res.status(403).json({ message: 'Admin only' });
};
