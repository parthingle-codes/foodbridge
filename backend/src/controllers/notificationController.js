const { success, error } = require('../utils/response');
const { store } = require('../services/dataStore');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let notifs = store.notifications.filter((n) => n.user_id === userId);

    if (notifs.length === 0) {
      notifs = store.notifications; // Demo sample notifications
    }

    const formatted = notifs.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      description: n.description || n.message,
      read: n.read === true,
      createdAt: n.created_at,
    }));

    return success(res, formatted, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifs = store.notifications.filter((n) => (n.user_id === userId || !n.user_id) && !n.read);
    return success(res, { count: notifs.length }, 'Unread count retrieved');
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notif = store.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
    }
    return success(res, { id, read: true }, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    store.notifications.forEach((n) => {
      if (n.user_id === userId || !n.user_id) n.read = true;
    });
    return success(res, { message: 'All notifications marked as read' }, 'Success');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
};
