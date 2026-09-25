/**
 * The store build must talk to the live API; only `npm run android:dev`
 * switches API_ENV to 'dev', and restores it afterwards.
 */
import { API_ENV } from '../src/config/apiEnv';

const loadApiUrl = (env) => {
  let url;
  jest.isolateModules(() => {
    jest.doMock('../src/config/apiEnv', () => ({ API_ENV: env }));
    const prevDev = global.__DEV__;
    const prevUrl = process.env.API_URL;
    global.__DEV__ = false;
    delete process.env.API_URL;
    url = require('../src/services/apiClient').API_URL;
    global.__DEV__ = prevDev;
    if (prevUrl !== undefined) process.env.API_URL = prevUrl;
  });
  return url;
};

it('committed API_ENV is prod', () => {
  expect(API_ENV).toBe('prod');
});

it('prod uses the live API, dev uses the dev API', () => {
  expect(loadApiUrl('prod')).toBe('https://waterappdashboard2.onrender.com/api');
  expect(loadApiUrl('dev')).toBe('https://waterappdashboard2-dev.onrender.com/api');
  expect(loadApiUrl('unknown')).toBe('https://waterappdashboard2.onrender.com/api');
});
