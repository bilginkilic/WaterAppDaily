import LocalizedStrings from 'react-native-localization';

const strings = new LocalizedStrings({
  en: {
    welcome: "WaterSave",
    slogan: "Every Drop Matters",
    email: "Email",
    password: "Password",
    login: "Login",
    forgotPassword: "Forgot Password?",
    surveyIntro: "Welcome to WaterSave!",
    surveyDescription: "Before we start, we'll ask you a few questions about your water usage habits. This will help us personalize your water-saving journey.",
    startSurvey: "Start Survey",
    continue: "Continue",
    cardOne: "Complete the Water Usage Survey",
    cardTwo: "Get Personalized Water-Saving Tasks",
    cardThree: "Track Your Progress & Save Water",
    questionProgress: "Question %d of %d",
    surveyComplete: "Survey Complete!",
    potentialSaving: "Potential Water Saving",
    currentUsage: "Current Water Usage",
    achievements: "Your Achievements",
    tasks: "Recommended Tasks",
    startJourney: "Start Your Water-Saving Journey",
    formatString: function(str, ...args) {
      return str.replace(/%d/g, function() {
        return args.shift() || '';
      });
    },
    waterSavingPotential: "You can save up to %d% of your water usage!",
    improvementArea: "Improvement Areas in %s",
    readyForChallenge: "Ready for the Challenge?",
    challengeDescription: "Start your water-saving journey now! Complete tasks in your improvement areas and track your progress daily.",
    startChallenge: "Start 30-Day Water Challenge",
    challengeTitle: "30-Day Water Challenge",
    categoryProgress: "Progress in %s",
    dailyTasks: "Today's Tasks",
    recentAchievements: "Recent Improvements",
    watchTutorial: "Watch Tutorial",
    needsImprovement: "Needs Improvement",
    improvedAnswer: "Great Improvement!",
    savedWater: "Saved %dL of water",
  },
  tr: {
    welcome: "WaterSave",
    slogan: "Her Damla Değerlidir",
    email: "E-posta",
    password: "Şifre",
    login: "Giriş Yap",
    forgotPassword: "Şifremi Unuttum",
    surveyIntro: "WaterSave'e Hoş Geldiniz!",
    surveyDescription: "Başlamadan önce, su kullanım alışkanlıklarınız hakkında birkaç soru soracağız. Bu, su tasarrufu yolculuğunuzu kişiselleştirmemize yardımcı olacak.",
    startSurvey: "Ankete Başla",
    continue: "Devam Et",
    cardOne: "Su Kullanım Anketini Tamamla",
    cardTwo: "Kişiselleştirilmiş Su Tasarrufu Görevlerini Al",
    cardThree: "İlerlemeni Takip Et & Su Tasarrufu Yap",
    questionProgress: "Soru %d / %d",
    surveyComplete: "Anket Tamamlandı!",
    potentialSaving: "Potansiyel Su Tasarrufu",
    currentUsage: "Mevcut Su Kullanımı",
    achievements: "Başarılarınız",
    tasks: "Önerilen Görevler",
    startJourney: "Su Tasarrufu Yolculuğuna Başla",
    formatString: function(str, ...args) {
      return str.replace(/%d/g, function() {
        return args.shift() || '';
      });
    },
    waterSavingPotential: "Su kullanımınızın %d% kadarını tasarruf edebilirsiniz!",
    improvementArea: "%s Alanında İyileştirmeler",
    readyForChallenge: "Meydan Okumaya Hazır mısınız?",
    challengeDescription: "Su tasarrufu yolculuğunuza şimdi başlayın! İyileştirme alanlarınızdaki görevleri tamamlayın ve günlük ilerlemenizi takip edin.",
    startChallenge: "30 Günlük Su Tasarrufu Meydan Okumasını Başlat",
    challengeTitle: "30 Günlük Su Tasarrufu",
    categoryProgress: "%s Alanında İlerleme",
    dailyTasks: "Bugünün Görevleri",
    recentAchievements: "Son İyileştirmeler",
    watchTutorial: "Eğitim Videosunu İzle",
    needsImprovement: "İyileştirme Gerekli",
    improvedAnswer: "Harika İyileştirme!",
    savedWater: "%dL su tasarrufu sağlandı",
  }
});

try {
  strings.setLanguage('en');
} catch (error) {
  console.warn('Language setting error:', error);
}

export default strings; 