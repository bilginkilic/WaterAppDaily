import { StorageService } from '../../src/services/storage';

describe('Water Consumption Calculations', () => {
  const mockSurveyData = {
    shower: 2,        // Günde 2 duş
    dishwashing: 3,   // Günde 3 kez bulaşık
    laundry: 1,       // Günde 1 çamaşır
    daily: 5          // Günlük 5L su kullanımı
  };

  const mockAchievements = [
    {
      type: 'Achievement',
      category: 'Shower',
      improvement: 5,
      date: new Date().toISOString()
    },
    {
      type: 'Achievement',
      category: 'Dishwashing',
      improvement: 3,
      date: new Date().toISOString()
    }
  ];

  describe('Initial Water Footprint Calculation', () => {
    it('should calculate correct initial water footprint', () => {
      const footprint = StorageService.calculateWaterFootprint(mockSurveyData);
      
      // Beklenen hesaplama:
      // Duş: 2 * 10L = 20L
      // Bulaşık: 3 * 15L = 45L
      // Çamaşır: 1 * 50L = 50L
      // Günlük: 5L
      const expectedFootprint = 120; // 20 + 45 + 50 + 5

      expect(footprint).toBe(expectedFootprint);
    });

    it('should handle missing survey data', () => {
      const footprint = StorageService.calculateWaterFootprint(null);
      expect(footprint).toBe(0);
    });

    it('should handle partial survey data', () => {
      const partialData = {
        shower: 1,
        dishwashing: 2
      };
      
      const footprint = StorageService.calculateWaterFootprint(partialData);
      // Duş: 1 * 10L = 10L
      // Bulaşık: 2 * 15L = 30L
      const expectedFootprint = 40;

      expect(footprint).toBe(expectedFootprint);
    });
  });

  describe('Water Savings Calculation', () => {
    it('should calculate correct total savings from achievements', () => {
      const totalSavings = mockAchievements.reduce((acc, achievement) => 
        acc + (achievement.improvement || 0), 0);
      
      expect(totalSavings).toBe(8); // 5L + 3L
    });

    it('should calculate current water footprint after achievements', () => {
      const initialFootprint = StorageService.calculateWaterFootprint(mockSurveyData);
      const totalSavings = mockAchievements.reduce((acc, achievement) => 
        acc + (achievement.improvement || 0), 0);
      
      const currentFootprint = initialFootprint - totalSavings;
      expect(currentFootprint).toBe(112); // 120L - 8L
    });
  });

  describe('Challenge Results Validation', () => {
    const mockChallenge = {
      category: 'Shower',
      targetSaving: 10,
      duration: 7, // 7 gün
      dailyActions: [
        { day: 1, saved: 2 },
        { day: 2, saved: 1 },
        { day: 3, saved: 2 },
        { day: 4, saved: 1 },
        { day: 5, saved: 2 },
        { day: 6, saved: 1 },
        { day: 7, saved: 2 }
      ]
    };

    it('should validate challenge completion percentage', () => {
      const totalSaved = mockChallenge.dailyActions.reduce((acc, day) => acc + day.saved, 0);
      const completionPercentage = (totalSaved / mockChallenge.targetSaving) * 100;
      
      expect(completionPercentage).toBeCloseTo(110, 2); // 11L saved / 10L target * 100
    });

    it('should validate daily savings are within reasonable limits', () => {
      mockChallenge.dailyActions.forEach(day => {
        // Duş için günlük maksimum tasarruf 5L olmalı
        expect(day.saved).toBeLessThanOrEqual(5);
        // Tasarruf negatif olmamalı
        expect(day.saved).toBeGreaterThanOrEqual(0);
      });
    });
  });
}); 