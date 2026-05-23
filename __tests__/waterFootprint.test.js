import {
  computeCurrentFootprint,
  sumSurveyValueTotals,
} from '../src/utils/waterFootprint';

describe('waterFootprint utils', () => {
  it('sums survey answer value totals', () => {
    const total = sumSurveyValueTotals([
      { valueTotal: 100 },
      { valueTotal: 50 },
      { valueTotal: undefined },
    ]);
    expect(total).toBe(150);
  });

  it('computes current footprint from completed challenge tasks only', () => {
    const current = computeCurrentFootprint(500, [
      { valueSaving: 80, earnedViaChallenge: true },
      { valueSaving: 20, earnedViaChallenge: true },
      { valueSaving: 50 }, // survey achievement — ignored
    ]);
    expect(current).toBe(400);
  });

  it('ignores survey achievements until challenge is completed', () => {
    expect(
      computeCurrentFootprint(817, [{ valueSaving: 53, type: 'Achievement' }])
    ).toBe(817);
  });

  it('never returns negative footprint', () => {
    expect(
      computeCurrentFootprint(100, [{ valueSaving: 200, earnedViaChallenge: true }])
    ).toBe(0);
  });
});
