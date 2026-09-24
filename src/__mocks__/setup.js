// Jest setup for React Native unit tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

jest.mock('react-native-localization', () => {
  return class MockLocalizedStrings {
    constructor(strings) {
      Object.assign(this, strings.en || strings);
    }
    setLanguage() {}
  };
});

jest.mock('react-native-push-notification', () => {
  const api = {
    configure: jest.fn(),
    createChannel: jest.fn(),
    localNotification: jest.fn(),
    localNotificationSchedule: jest.fn(),
    cancelAllLocalNotifications: jest.fn(),
    cancelLocalNotification: jest.fn(),
    requestPermissions: jest.fn(() => Promise.resolve({})),
    checkPermissions: jest.fn(),
  };
  return {
    __esModule: true,
    default: api,
    Importance: { DEFAULT: 3, HIGH: 4, LOW: 2, MIN: 1, NONE: 0, UNSPECIFIED: -1000 },
  };
});

jest.mock('@react-native-community/push-notification-ios', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(() => Promise.resolve({})),
}));
