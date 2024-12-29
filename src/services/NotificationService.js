import PushNotification, { Importance } from 'react-native-push-notification';
import { Platform } from 'react-native';

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

  scheduleReminderNotification(hour = 10, minute = 0) {
    PushNotification.localNotificationSchedule({
      channelId: 'water-save-reminders',
      title: "Time to Save Water! 💧",
      message: "Check your daily water-saving challenges and make a difference!",
      date: this.getNextNotificationDate(hour, minute),
      allowWhileIdle: true,
      repeatType: 'day',
    });
  }

  scheduleMotivationalNotification(hour = 18, minute = 0) {
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
      message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
      date: this.getNextNotificationDate(hour, minute),
      allowWhileIdle: true,
      repeatType: 'day',
    });
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
}

export default new NotificationService(); 