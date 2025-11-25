const { validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ResetToken = require('../models/ResetToken');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/sendEmail');

function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    // create uniqId: firstName + 3-digit number
    const base = (firstName || 'user').replace(/\s+/g, '');
    const count = Math.floor(Math.random() * 900) + 100;
    const uniqId = `${base}${count}`;

    const user = new User({ firstName, lastName, email, phone, password, uniqId });
    await user.save();
    res.json({ token: generateToken(user), user: { id: user._id, uniqId: user.uniqId, firstName: user.firstName } });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Register failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user), user: { id: user._id, firstName: user.firstName, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No user found with this email" });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await ResetToken.create({ userId: user._id, token, expiresAt });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await sendEmail(
      user.email,
      "Reset Your Password",
      forgotPasswordTemplate(user, resetLink)
    );

    res.json({ message: "Reset email sent successfully" });

  } catch (err) {
    res.status(500).json({ message: "Failed to send reset email" });
  }
};


exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const rec = await ResetToken.findOne({ token });
  if (!rec || rec.expiresAt < Date.now()) return res.status(400).json({ message: 'Invalid token' });
  const user = await User.findById(rec.userId);
  user.password = newPassword;
  await user.save();
  await ResetToken.deleteMany({ userId: user._id });
  res.json({ message: 'Password reset' });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { firstName, lastName, addresses } = req.body;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (addresses) user.addresses = addresses;
  await user.save();
  res.json(user);
};
