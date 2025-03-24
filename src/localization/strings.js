import LocalizedStrings from 'react-native-localization';

const strings = new LocalizedStrings({
  en: {
    welcome: "WaterSave",
    slogan: "Every Drop Matters",
    email: "Email",
    password: "Password",
    login: "Login",
    forgotPassword: "Forgot Password?",
    register: "Register",
    name: "Name",
    surveyIntro: "Welcome to WaterSave!",
    surveyDescription: "Before we start, we'll ask you a few questions about your water usage habits. This will help us personalize your water-saving journey.",
    startSurvey: "Start Survey",
    continue: "Continue",
    skip: "Skip",
    next: "Next",
    back: "Back",
    getStarted: "Get Started",
    cardOne: "Complete the Water Usage Survey",
    cardTwo: "Get Personalized Water-Saving Tasks",
    cardThree: "Track Your Progress & Save Water",
    questionProgress: "Question %d of %d",
    surveyComplete: "Survey Complete!",
    potentialSaving: "Potential Water Savings",
    currentUsage: "Current Water Usage",
    achievements: "Your Achievements",
    tasks: "Recommended Tasks",
    startJourney: "Start Your Water-Saving Journey",
    waterSavingPotential: "Potential Water Savings",
    improvementArea: "Improvement Areas - %s",
    readyForChallenge: "Ready for the Challenge?",
    challengeDescription: "Start your water-saving journey now! Complete tasks in your improvement areas and track your progress daily.",
    startChallenge: "Start 2-Week Challenge",
    challengeTitle: "2-Week Water Challenge",
    categoryProgress: "Progress in %s",
    dailyTasks: "Learning Resources",
    recentAchievements: "Recent Improvements",
    watchTutorial: "Watch Tutorial",
    needsImprovement: "Needs Improvement",
    improvedAnswer: "Great Improvement!",
    savedWater: "Saved %dL of water",
    closeVideo: "Close",
    learnMore: "Learn More",
    readMore: "Read Article",
    close: "Close",
    error: "Error",
    videoLoadError: "Could not load the video. Please try again later.",
    noImprovement: "Start completing tasks to reduce your water usage",
    dailyProgress: "Daily Water Savings",
    waterUsageTitle: "Your Daily Water Usage",
    savingsTitle: "Potential Savings",
    savingsDaily: "daily",
    yearlyLabel: "Potential yearly savings:",
    improvementAreasTitle: "Improvement Areas",
    improvementAreasDesc: "You can reduce your water consumption by making changes in these areas:",
    challengeInfo: "Join the 2-week water saving challenge to change your habits and discover your true saving potential.",
    startChallengeButton: "Start Challenge",
    errorCalculating: "An error occurred while calculating your water footprint. Please try again.",
    answerRecorded: "Answer recorded"
  }
});

try {
  strings.setLanguage('en');
} catch (error) {
  console.warn('Language setting error:', error);
}

export default strings; 