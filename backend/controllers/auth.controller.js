const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { sendPasswordResetEmail } = require('../services/email.service');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: hashed },
      select: { id: true, name: true, email: true, role: true },
    });

    // Create empty cart and wishlist for new user
    await prisma.cart.create({ data: { userId: user.id } });
    await prisma.wishlist.create({ data: { userId: user.id } });

    res.status(201).json({ user, token: generateToken(user.id) });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token: generateToken(user.id) });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, shopName: true, bio: true, verified: true, createdAt: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, role: true, shopName: true, bio: true, verified: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always respond with success — never reveal if email exists (security)
    const OK = { message: 'If that email is registered, a reset link has been sent.' };

    if (!user) return res.json(OK);

    // Invalidate previous unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token: rawToken, expiresAt },
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gebeya-b.vercel.app';
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({ email: user.email, name: user.name, resetUrl });
    res.json(OK);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record || record.used || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    });

    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used: true },
    });

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, forgotPassword, resetPassword };

