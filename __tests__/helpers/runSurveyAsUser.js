import { fireEvent, waitFor } from '@testing-library/react-native';
import questions from '../../src/data/questions';

/**
 * Taps survey options exactly like a user would on SurveyScreen.
 */
export async function runSurveyAsUser(screen, path) {
  for (let i = 0; i < path.length; i += 1) {
    const choice = path[i];
    const question = questions[i];

    await waitFor(() => {
      expect(screen.getByText(question.text)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(choice));

    const isEarlyExit = question.id === 9 && choice === 'No';
    const isLastQuestion = i === path.length - 1;

    if (!isEarlyExit && !isLastQuestion) {
      await waitFor(() => {
        expect(screen.getByText(questions[i + 1].text)).toBeTruthy();
      });
    }
  }
}
