/**
 * Shared device: local challenge data must not leak from one account into another.
 * Regression for two accounts ending up with identical footprints after signing in
 * on the same phone (survey data survived sign-out and was synced to the new account).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from '../src/services/DataService';
import StorageService from '../src/services/StorageService';
import { syncProfileToServer } from '../src/services/syncService';
import { apiRequest } from '../src/services/apiClient';

jest.mock('../src/services/apiClient', () => ({
  apiRequest: jest.fn(),
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  API_URL: 'http://test.local/api',
}));

const USER_A = { userId: 'user-a', token: 'token-a', email: 'a@test.local' };
const USER_B = { userId: 'user-b', token: 'token-b', email: 'b@test.local' };

async function seedCompletedSurvey() {
  await DataService.saveSurveyAnswersInit({ questionId: 1, valueTotal: 100 });
  await DataService.saveSurveyAnswersInit({ questionId: 2, valueTotal: 41 });
  await DataService.saveTasks([{ id: 't1', completed: true }]);
  await DataService.markSurveyCompleted();
}

async function loginAs(user) {
  apiRequest.mockResolvedValueOnce({ token: user.token, userId: user.userId, name: user.email });
  return StorageService.login(user.email, 'secret');
}

async function signOut() {
  // Mirrors AuthContext.clearAuthSession: auth keys go, survey progress stays.
  await AsyncStorage.multiRemove(['userToken', 'userId', 'userName', 'userEmail']);
  await DataService.clearUserData();
}

describe('Local challenge data ownership on a shared device', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    apiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  it("clears the previous account's survey data when a different account signs in", async () => {
    await loginAs(USER_A);
    await seedCompletedSurvey();
    expect(await DataService.InitialWaterFootPrint()).toBe(141);

    await signOut();
    await loginAs(USER_B);

    expect(await DataService.getSurveyAnswersInit()).toEqual([]);
    expect(await DataService.getTasks()).toEqual([]);
    expect(await DataService.isSurveyCompleted()).toBe(false);
    expect((await DataService.getUserData()).surveyTaken).toBe(false);
    expect(await DataService.getDataOwner()).toBe(USER_B.userId);
  });

  it('keeps survey data when the same account signs in again', async () => {
    await loginAs(USER_A);
    await seedCompletedSurvey();

    await signOut();
    await loginAs(USER_A);

    expect(await DataService.InitialWaterFootPrint()).toBe(141);
    expect(await DataService.isSurveyCompleted()).toBe(true);
    expect(await DataService.getDataOwner()).toBe(USER_A.userId);
  });

  it('lets an account adopt a guest survey completed before signing in', async () => {
    await DataService.prepareGuestSession();
    await seedCompletedSurvey();

    await loginAs(USER_B);

    expect(await DataService.InitialWaterFootPrint()).toBe(141);
    expect(await DataService.getDataOwner()).toBe(USER_B.userId);
  });

  it('starting a guest session drops the previous owner', async () => {
    await loginAs(USER_A);
    await seedCompletedSurvey();
    await signOut();

    await DataService.prepareGuestSession();

    expect(await DataService.getDataOwner()).toBeNull();
    expect(await DataService.getSurveyAnswersInit()).toEqual([]);
  });

  it("never syncs one account's local data into another account", async () => {
    await loginAs(USER_A);
    await seedCompletedSurvey();
    // Simulate a stale session record pointing at another account.
    await DataService.setUserData({ ...(await DataService.getUserData()), ...USER_B, isLoggedIn: true });

    const result = await syncProfileToServer();

    expect(result).toEqual({ synced: false, reason: 'owner_mismatch' });
    expect(apiRequest).not.toHaveBeenCalledWith('/waterprint/sync', expect.anything());
  });

  it("syncs the owner's own data", async () => {
    await loginAs(USER_A);
    await seedCompletedSurvey();
    apiRequest.mockResolvedValueOnce({});

    const result = await syncProfileToServer();

    expect(result).toEqual({ synced: true });
    expect(apiRequest).toHaveBeenLastCalledWith(
      '/waterprint/sync',
      expect.objectContaining({
        token: USER_A.token,
        body: expect.objectContaining({ initialWaterprint: 141 }),
      })
    );
  });
});
