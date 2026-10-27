const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const protect = require('../middleware/auth');

const router = express.Router();

// Users and passwords live in Supabase Auth. After Supabase verifies the
// credentials, the API issues its own 7-day token so the frontend stays simple.
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendAuth = (res, user, status = 200) =>
  res.status(status).json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  });

router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // email_confirm: true -> no confirmation email needed (avoids free-tier email limits)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() },
    });

    if (error) {
      if (error.code === 'email_exists' || /already|registered/i.test(error.message))
        return res.status(409).json({ message: 'Email already registered' });
      return res.status(400).json({ message: error.message });
    }

    sendAuth(res, { id: data.user.id, name: name.trim(), email }, 201);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const { data, error } = await supabase.newClient().auth.signInWithPassword({ email, password });
    if (error || !data?.user) return res.status(401).json({ message: 'Invalid email or password' });

    const u = data.user;
    sendAuth(res, { id: u.id, name: u.user_metadata?.name || email.split('@')[0], email: u.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, (req, res) => {
  const { id, name, email } = req.user;
  res.json({ user: { id, name, email } });
});

module.exports = router;
