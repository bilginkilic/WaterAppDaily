import LocalizedStrings from 'react-native-localization';

const strings = new LocalizedStrings({
  en: {
    welcome: "WaterSave",
    slogan: "Every Drop Counts Towards a Sustainable Future",
    email: "Email",
    password: "Password",
    login: "Login",
    forgotPassword: "Forgot Password?",
    register: "Register",
    name: "Name",
    surveyIntro: "Welcome to WaterSave!",
    surveyDescription: "Let's start by understanding your water usage habits. This brief survey will help us create a personalized water conservation plan for you.",
    startSurvey: "Start Water Usage Survey",
    continue: "Continue",
    skip: "Skip",
    next: "Next",
    back: "Back",
    getStarted: "Begin Your Water-Saving Journey",
    cardOne: "Complete Your Water Usage Assessment",
    cardTwo: "Receive Personalized Conservation Tasks",
    cardThree: "Track Progress & Reduce Water Footprint",
    questionProgress: "Question %d of %d",
    surveyComplete: "Assessment Complete!",
    potentialSaving: "Potential Water Conservation",
    currentUsage: "Current Water Consumption",
    achievements: "Water Conservation Achievements",
    tasks: "Water-Saving Recommendations",
    startJourney: "Start Your Conservation Journey",
    waterSavingPotential: "Water Conservation Potential",
    improvementArea: "Conservation Focus Areas - %s",
    readyForChallenge: "Ready to Make a Difference?",
    challengeDescription: "Begin your water conservation journey today! Complete personalized tasks in your focus areas and track your daily progress.",
    startChallenge: "Begin 2-Week Water Challenge",
    challengeTitle: "2-Week Water Conservation Challenge",
    categoryProgress: "Progress in %s",
    dailyTasks: "Conservation Resources",
    recentAchievements: "Recent Conservation Milestones",
    watchTutorial: "Watch Conservation Guide",
    needsImprovement: "Opportunity for Improvement",
    improvedAnswer: "Excellent Progress!",
    savedWater: "Conserved %dL of water",
    closeVideo: "Close",
    learnMore: "Learn More",
    readMore: "Read Full Article",
    close: "Close",
    error: "Error",
    videoLoadError: "Unable to load the conservation guide. Please try again later.",
    noImprovement: "Start completing tasks to reduce your water consumption",
    dailyProgress: "Daily Water Conservation",
    waterUsageTitle: "Your Daily Water Consumption",
    savingsTitle: "Conservation Potential",
    savingsDaily: "daily savings",
    yearlyLabel: "Potential yearly conservation:",
    improvementAreasTitle: "Focus Areas for Conservation",
    improvementAreasDesc: "These are the key areas where you can make significant improvements in water conservation:",
    challengeInfo: "Join our 2-week water conservation challenge to develop sustainable habits and discover your conservation potential.",
    startChallengeButton: "Begin Challenge",
    errorCalculating: "An error occurred while calculating your water consumption profile. Please try again.",
    answerRecorded: "Response recorded",
    unlockedBadges: "Conservation Achievements",
    totalWaterSaved: "Total Water Conserved"
  }
});

try {
  strings.setLanguage('en');
} catch (error) {
  console.warn('Language setting error:', error);
}

export default strings; 