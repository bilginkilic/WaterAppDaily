/**
 * Normalize survey answers for API / dashboard (initialAssessment.answers).
 */
export function normalizeSurveyAnswers(answers) {
  if (!Array.isArray(answers)) {
    return [];
  }

  return answers.map((entry) => ({
    questionId: entry.questionId,
    answer: entry.answer ?? entry.text ?? '',
    valueTotal: Number(entry.valueTotal) || 0,
    valueSaving: Number(entry.valueSaving) || 0,
    type: entry.type || 'Unknown',
    category: entry.category || null,
    timestamp: entry.timestamp || new Date().toISOString(),
  }));
}

export function countAchievements(answers) {
  return normalizeSurveyAnswers(answers).filter((a) => a.type === 'Achievement').length;
}
