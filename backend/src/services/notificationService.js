const db = require('../config/database');
const config = require('../config');

class NotificationService {
  // Create in-app notification
  async notify(userId, type, title, message, data = {}) {
    try {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, data, channel)
         VALUES ($1, $2, $3, $4, $5, 'IN_APP')`,
        [userId, type, title, message, JSON.stringify(data)]
      );

      // Try Telegram if configured
      if (config.telegram.enabled && config.telegram.botToken) {
        await this.sendTelegram(userId, title, message);
      }
    } catch (err) {
      console.error('Notification error:', err.message);
      // Don't throw - notifications should not block main flow
    }
  }

  async sendTelegram(userId, title, message) {
    try {
      // Look up telegram_chat_id from profiles
      const results = await db.query(
        `SELECT telegram_chat_id FROM donor_profiles WHERE user_id = $1
         UNION
         SELECT telegram_chat_id FROM organizations WHERE user_id = $1
         UNION
         SELECT telegram_chat_id FROM volunteer_profiles WHERE user_id = $1`,
        [userId]
      );

      const chatId = results.rows.find((r) => r.telegram_chat_id)?.telegram_chat_id;
      if (!chatId) return;

      const TelegramBot = require('node-telegram-bot-api');
      const bot = new TelegramBot(config.telegram.botToken);
      await bot.sendMessage(chatId, `*${title}*\n${message}`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error('Telegram notification failed:', err.message);
    }
  }

  async getNotifications(userId, limit = 50, unreadOnly = false) {
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params = [userId];
    if (unreadOnly) {
      query += ' AND is_read = false';
    }
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await db.query(query, params);
    return result.rows;
  }

  async markAsRead(notificationId, userId) {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );
  }

  async markAllRead(userId) {
    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );
  }
}

module.exports = new NotificationService();
