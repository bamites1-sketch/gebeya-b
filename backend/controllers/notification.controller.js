const prisma = require('../lib/prisma');

// Create a notification (internal helper)
const createNotification = async ({ userId, title, message, type, link }) => {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type: type || 'INFO', link: link || null },
    });
  } catch (e) {
    console.error('Notification creation failed:', e.message);
  }
};

// Get notifications for current user
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });
    res.json({ notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// Mark one as read
const markRead = async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
const deleteNotification = async (req, res, next) => {
  try {
    await prisma.notification.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { createNotification, getNotifications, markRead, markAllRead, deleteNotification };
