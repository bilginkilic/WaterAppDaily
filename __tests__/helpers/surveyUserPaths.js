import questions from '../../src/data/questions';
import { sumSurveyValueTotals } from '../../src/utils/waterFootprint';

/**
 * Realistic user personas — option.text values per question index.
 * Mirrors tapping buttons on SurveyScreen.
 */
export const USER_PATHS = {
  /** Eco-conscious: mostly Achievement answers, skips car wash (no vehicle). */
  ecoFriendly: [
    'Yes',           // Q1 dishwasher
    'No',            // Q2 no pre-rinse
    'Full',          // Q3 full load
    'Yes',           // Q4 aerators
    'Under 5 mins',  // Q5 short shower
    'Full',          // Q6 full laundry
    'Yes',           // Q7 turn off tap
    'No',            // Q8 no leaks
    'No',            // Q9 no vehicle → survey ends
  ],
  /** Mixed habits: creates several Task items for challenge screen. */
  needsImprovement: [
    'No',            // Q1 hand wash → Task
    'Yes',           // Q2 pre-rinse → Task
    'Half full',     // Q3 → Task
    'No',            // Q4 no aerators → Task
    '5 - 10 mins',   // Q5 → Task
    'Half full',     // Q6 → Task
    'No',            // Q7 → Task
    'Yes',           // Q8 leaks → Task
    'No',            // Q9 no vehicle
  ],
};

export function getQuestionOption(questionIndex, optionText) {
  const question = questions[questionIndex];
  const option = question.options.find((o) => o.text === optionText);
  if (!option) {
    throw new Error(
      `Option "${optionText}" not found for Q${question.id}: ${question.text}`
    );
  }
  return option;
}

export function computeExpectedFromPath(path) {
  const answers = path.map((text, index) => {
    const q = questions[index];
    const opt = getQuestionOption(index, text);
    return {
      questionId: q.id,
      answer: opt.text,
      valueTotal: opt.valueTotal || 0,
      valueSaving: opt.valueSaving || 0,
      type: opt.type,
      category: q.category,
    };
  });

  const initial = sumSurveyValueTotals(answers);
  const achievements = answers.filter((a) => a.type === 'Achievement');
  const tasks = answers.filter((a) => a.type === 'Task');
  // Before any challenge task is completed, current equals initial.
  const current = initial;

  return { answers, initial, current, tasks, achievements };
}
