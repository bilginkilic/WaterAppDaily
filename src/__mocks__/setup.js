import mockAsyncStorage from './async-storage';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-localization', () => {
  return class LocalizedStrings {
    constructor(strings) {
      this.strings = strings;
      this.language = 'en';
    }
    setLanguage(language) {
      this.language = language;
    }
    getString(key) {
      return this.strings[this.language][key] || key;
    }
    formatString(str, ...args) {
      return str.replace(/%[sd]/g, function() {
        return args.shift() || '';
      });
    }
  };
}); 