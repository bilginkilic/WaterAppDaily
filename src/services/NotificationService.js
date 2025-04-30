import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';
import DataService from './DataService';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
  }

  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log("TOKEN:", token);
      },

      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  createDefaultChannels() {
    PushNotification.createChannel(
      {
        channelId: "water-save-reminders",
        channelName: "Water Save Reminders",
        channelDescription: "Daily reminders for water saving challenges",
        playSound: true,
        soundName: "default",
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  async scheduleReminderNotification(hour = 10, minute = 0) {
    try {
      const tasks = await DataService.getTasks();
      if (tasks && tasks.length > 0) {
        PushNotification.localNotificationSchedule({
          channelId: 'water-save-reminders',
          title: "Time to Save Water! 💧",
          message: `You have ${tasks.length} water-saving challenges waiting for you!`,
          date: this.getNextNotificationDate(hour, minute),
          allowWhileIdle: true
        });
        console.log('Morning reminder scheduled for', tasks.length, 'tasks');
      } else {
        console.log('No tasks available, skipping morning reminder');
      }
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
    }
  }

  async scheduleMotivationalNotification(hour = 18, minute = 0) {
    try {
      const tasks = await DataService.getTasks();
      if (tasks && tasks.length > 0) {
        const motivationalMessages = [
          "Every drop counts! Keep up the good work! 🌊",
          "You're making a difference with every water-saving action! 💪",
          "Your efforts are helping our planet! 🌍",
          "Small changes lead to big impacts! Keep going! ⭐",
          "You're a water-saving champion! 🏆",
        ];

        PushNotification.localNotificationSchedule({
          channelId: 'water-save-reminders',
          title: "Water Saving Progress",
          message: `${motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]} You have ${tasks.length} challenges remaining.`,
          date: this.getNextNotificationDate(hour, minute),
          allowWhileIdle: true
        });
        console.log('Evening reminder scheduled for', tasks.length, 'tasks');
      } else {
        console.log('No tasks available, skipping evening reminder');
      }
    } catch (error) {
      console.error('Error scheduling motivational notification:', error);
    }
  }

  scheduleChallengeReminder(remainingChallenges) {
    if (remainingChallenges > 0) {
      PushNotification.localNotification({
        channelId: 'water-save-reminders',
        title: "Incomplete Challenges",
        message: `You have ${remainingChallenges} water-saving challenges remaining today!`,
        allowWhileIdle: true,
      });
    }
  }

  getNextNotificationDate(hour, minute) {
    const now = new Date();
    const scheduledTime = new Date(now);
    scheduledTime.setHours(hour);
    scheduledTime.setMinutes(minute);
    scheduledTime.setSeconds(0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  showNotification(title, message, options = {}) {
    PushNotification.localNotification({
      channelId: 'water-save-channel',
      title: title,
      message: message,
      bigText: options.bigText || message,
      subText: options.subText || 'WaterSave',
      vibrate: options.vibrate !== false,
      playSound: options.playSound !== false,
      soundName: options.soundName || 'default',
      importance: Importance.HIGH,
      priority: 'high',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
    });
  }
}

export default new NotificationService(); 