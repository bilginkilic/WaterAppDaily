/**
 * Current daily water footprint = initial minus savings from completed challenge tasks.
 * Survey "Achievement" answers do not reduce current until the user completes the task
 * in the Challenges screen (earnedViaChallenge).
 */
export function computeCurrentFootprint(initialFootprint, achievements) {
  const initial = Number(initialFootprint) || 0;
  const savings = (achievements || [])
    .filter((item) => item.earnedViaChallenge === true)
    .reduce((sum, item) => sum + (Number(item.valueSaving) || 0), 0);
  return Math.max(0, initial - savings);
}

export function sumSurveyValueTotals(answers) {
  return (answers || []).reduce(
    (sum, answer) => sum + (Number(answer.valueTotal) || 0),
    0
  );
}

/**
 * Potential saving if every open task were completed: for each Task answer, the
 * largest valueSaving among that question's Achievement options. This is the same
 * amount computeCurrentFootprint deducts when the task is completed via a challenge,
 * so the results screen, profile and challenges all agree.
 */
export function computePotentialSaving(taskAnswers, questionList) {
  const byId = new Map((questionList || []).map((q) => [q.id, q]));
  return (taskAnswers || [])
    .filter((answer) => answer.type === 'Task')
    .reduce((sum, answer) => {
      const question = byId.get(answer.questionId);
      if (!question) return sum;
      const best = question.options
        .filter((o) => o.type === 'Achievement')
        .reduce((max, o) => Math.max(max, Number(o.valueSaving) || 0), 0);
      return sum + best;
    }, 0);
}
