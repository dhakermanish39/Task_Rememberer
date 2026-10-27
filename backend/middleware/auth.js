const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

module.exports = async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // make sure the Supabase Auth user still exists
    const { data, error } = await supabase.auth.admin.getUserById(decoded.id);
    if (error || !data?.user) return res.status(401).json({ message: 'User no longer exists' });

    const u = data.user;
    req.user = { id: u.id, name: u.user_metadata?.name || u.email, email: u.email };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
