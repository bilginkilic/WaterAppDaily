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
