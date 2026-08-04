const Notification = require('../models/Notification');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notifications });
  } catch (error) { next(error); }
};

exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'Marked as read.' });
  } catch (error) { next(error); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) { next(error); }
};