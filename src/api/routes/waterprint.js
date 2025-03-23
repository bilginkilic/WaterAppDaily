// Mevcut waterprint routes
const router = require('express').Router();
const auth = require('../middleware/auth');

// Mevcut endpoint'ler
router.post('/add', auth, addWaterprint);
router.get('/daily', auth, getDailyWaterprint);
router.get('/weekly', auth, getWeeklyWaterprint);

// Yeni endpoint'ler
// Başlangıç su ayak izi ve değerlendirme sonuçları
router.post('/initial-assessment', auth, async (req, res) => {
  try {
    const {
      initialWaterprint,
      answers,
      correctAnswersCount
    } = req.body;

    const profile = await WaterprintProfile.create({
      userId: req.user.id,
      initialWaterprint,
      currentWaterprint: initialWaterprint,
      initialAssessment: {
        answers,
        correctAnswersCount,
        date: new Date()
      },
      progressHistory: [{
        date: new Date(),
        waterprint: initialWaterprint
      }]
    });

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 500
    });
  }
});

// Task tamamlama ve su ayak izi güncelleme
router.put('/update-task', auth, async (req, res) => {
  try {
    const {
      taskId,
      waterprintReduction
    } = req.body;

    const profile = await WaterprintProfile.findOne({ userId: req.user.id });
    const newWaterprint = profile.currentWaterprint - waterprintReduction;

    profile.currentWaterprint = newWaterprint;
    profile.completedTasks.push({
      taskId,
      waterprintReduction,
      completionDate: new Date()
    });
    profile.progressHistory.push({
      date: new Date(),
      waterprint: newWaterprint
    });

    await profile.save();

    res.json({
      success: true,
      newWaterprint,
      totalReduction: profile.initialWaterprint - newWaterprint
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 500
    });
  }
});

// İlerleme durumu
router.get('/progress', auth, async (req, res) => {
  try {
    const profile = await WaterprintProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        error: "Profil bulunamadı",
        status: 404
      });
    }

    res.json({
      initialWaterprint: profile.initialWaterprint,
      currentWaterprint: profile.currentWaterprint,
      waterprintReduction: profile.initialWaterprint - profile.currentWaterprint,
      correctAnswersCount: profile.initialAssessment.correctAnswersCount,
      completedTasks: profile.completedTasks,
      progressHistory: profile.progressHistory
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 500
    });
  }
});

module.exports = router; 