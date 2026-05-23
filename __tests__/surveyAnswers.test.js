import {
  normalizeSurveyAnswers,
  countAchievements,
} from '../src/utils/surveyAnswers';

describe('surveyAnswers utils', () => {
  it('normalizes raw survey entries for API', () => {
    const normalized = normalizeSurveyAnswers([
      {
        questionId: 1,
        text: 'Yes',
        valueTotal: 15,
        valueSaving: 10,
        type: 'Achievement',
        category: 'shower',
      },
    ]);

    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      questionId: 1,
      answer: 'Yes',
      valueTotal: 15,
      valueSaving: 10,
      type: 'Achievement',
      category: 'shower',
    });
    expect(normalized[0].timestamp).toBeDefined();
  });

  it('counts achievement answers', () => {
    const answers = normalizeSurveyAnswers([
      { questionId: 1, answer: 'A', type: 'Achievement', valueTotal: 1, valueSaving: 0 },
      { questionId: 2, answer: 'B', type: 'Task', valueTotal: 2, valueSaving: 0 },
    ]);
    expect(countAchievements(answers)).toBe(1);
  });
});
