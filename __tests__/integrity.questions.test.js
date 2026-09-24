/**
 * Integrity checks on the survey data that drives the water footprint.
 * Structural rules must always hold. Value-rule breaches are pinned in
 * KNOWN_VALUE_EXCEPTIONS until the analyst review settles the numbers, so a
 * new inconsistency fails the build while the known ones stay visible.
 */
import questions from '../src/data/questions';
import { categoryIds } from '../src/data/categories';
import {
  computeCurrentFootprint,
  computePotentialSaving,
  sumSurveyValueTotals,
} from '../src/utils/waterFootprint';

// "<questionId>:<option text>" — saving ≠ reference total − option total.
const KNOWN_VALUE_EXCEPTIONS = [
  '3:Full',
  '5:5 - 10 mins',
  '6:Full',
  '8:Yes',
  '8:Sometimes',
  '10:Yes',
];

const referenceOf = (q) => q.options.find((o) => o.type === 'Task' && o.valueSaving === 0);
const isNotApplicable = (o) => o.valueTotal === 0 && o.valueSaving === 0;

describe('questions.js structure', () => {
  it('has 10 questions with unique, sequential ids', () => {
    expect(questions.map((q) => q.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it.each(questions.map((q) => [q.id, q]))('Q%s is well formed', (_id, q) => {
    expect(Object.values(categoryIds)).toContain(q.category);
    expect(q.text).toEqual(expect.any(String));
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    const texts = q.options.map((o) => o.text);
    expect(new Set(texts).size).toBe(texts.length);
    q.options.forEach((o) => {
      expect(['Task', 'Achievement']).toContain(o.type);
      expect(Number.isFinite(o.valueTotal)).toBe(true);
      expect(Number.isFinite(o.valueSaving)).toBe(true);
      expect(o.valueTotal).toBeGreaterThanOrEqual(0);
    });
  });

  it.each(questions.map((q) => [q.id, q]))('Q%s has a Task reference option with saving 0', (_id, q) => {
    expect(referenceOf(q)).toBeDefined();
  });

  it('achievement options never have a negative saving', () => {
    const bad = questions.flatMap((q) =>
      q.options.filter((o) => o.type === 'Achievement' && o.valueSaving < 0).map((o) => `${q.id}:${o.text}`)
    );
    expect(bad).toEqual([]);
  });

  it('every question has at least one achievement so a challenge can be completed', () => {
    questions.forEach((q) => {
      expect(q.options.some((o) => o.type === 'Achievement')).toBe(true);
    });
  });
});

describe('saving rule: saving = reference total − option total', () => {
  const violations = questions.flatMap((q) => {
    const ref = referenceOf(q);
    return q.options
      .filter((o) => !isNotApplicable(o))
      .filter((o) => ref.valueTotal - o.valueTotal !== o.valueSaving)
      .map((o) => `${q.id}:${o.text}`);
  });

  it('has no breaches beyond the known list', () => {
    expect(violations.filter((v) => !KNOWN_VALUE_EXCEPTIONS.includes(v))).toEqual([]);
  });

  it('known list has no stale entries (remove them once fixed)', () => {
    expect(KNOWN_VALUE_EXCEPTIONS.filter((v) => !violations.includes(v))).toEqual([]);
  });
});

describe('footprint range', () => {
  const totals = (pick) => questions.reduce((sum, q) => sum + pick(q.options.map((o) => o.valueTotal)), 0);

  it('theoretical min and max match the analyst sheet', () => {
    expect(totals((v) => Math.min(...v))).toBe(10380);
    expect(totals((v) => Math.max(...v))).toBe(21196);
  });

  it('completing every task never pushes the footprint below zero', () => {
    const worst = questions.map((q) => ({ ...referenceOf(q), questionId: q.id }));
    const initial = sumSurveyValueTotals(worst);
    const potential = computePotentialSaving(worst, questions);
    const earned = worst.map((a) => {
      const best = questions
        .find((q) => q.id === a.questionId)
        .options.filter((o) => o.type === 'Achievement')
        .sort((x, y) => y.valueSaving - x.valueSaving)[0];
      return { ...best, earnedViaChallenge: true };
    });
    const current = computeCurrentFootprint(initial, earned);
    expect(current).toBe(Math.max(0, initial - potential));
    expect(current).toBeGreaterThanOrEqual(0);
  });
});
