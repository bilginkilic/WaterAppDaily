describe('Challenge Result Validation', () => {
  const mockChallenges = [
    {
      id: 1,
      category: 'Shower',
      startDate: new Date('2024-03-01').toISOString(),
      endDate: new Date('2024-03-07').toISOString(),
      targetSaving: 35, // 7 gün * 5L
      dailyActions: [
        { day: 1, saved: 4, date: '2024-03-01' },
        { day: 2, saved: 5, date: '2024-03-02' },
        { day: 3, saved: 3, date: '2024-03-03' },
        { day: 4, saved: 4, date: '2024-03-04' },
        { day: 5, saved: 5, date: '2024-03-05' },
        { day: 6, saved: 4, date: '2024-03-06' },
        { day: 7, saved: 5, date: '2024-03-07' }
      ]
    },
    {
      id: 2,
      category: 'Dishwashing',
      startDate: new Date('2024-03-08').toISOString(),
      endDate: new Date('2024-03-14').toISOString(),
      targetSaving: 21, // 7 gün * 3L
      dailyActions: [
        { day: 1, saved: 2, date: '2024-03-08' },
        { day: 2, saved: 3, date: '2024-03-09' },
        { day: 3, saved: 2, date: '2024-03-10' },
        { day: 4, saved: 3, date: '2024-03-11' },
        { day: 5, saved: 2, date: '2024-03-12' },
        { day: 6, saved: 3, date: '2024-03-13' },
        { day: 7, saved: 2, date: '2024-03-14' }
      ]
    }
  ];

  describe('Challenge Structure Validation', () => {
    it('should have valid challenge structure', () => {
      mockChallenges.forEach(challenge => {
        expect(challenge).toHaveProperty('id');
        expect(challenge).toHaveProperty('category');
        expect(challenge).toHaveProperty('startDate');
        expect(challenge).toHaveProperty('endDate');
        expect(challenge).toHaveProperty('targetSaving');
        expect(challenge).toHaveProperty('dailyActions');
        expect(Array.isArray(challenge.dailyActions)).toBe(true);
      });
    });

    it('should have valid daily actions structure', () => {
      mockChallenges.forEach(challenge => {
        challenge.dailyActions.forEach(action => {
          expect(action).toHaveProperty('day');
          expect(action).toHaveProperty('saved');
          expect(action).toHaveProperty('date');
          expect(typeof action.day).toBe('number');
          expect(typeof action.saved).toBe('number');
          expect(typeof action.date).toBe('string');
        });
      });
    });
  });

  describe('Challenge Results Calculation', () => {
    it('should calculate correct total savings for each challenge', () => {
      mockChallenges.forEach(challenge => {
        const totalSaved = challenge.dailyActions.reduce((acc, action) => 
          acc + action.saved, 0);
        
        if (challenge.category === 'Shower') {
          expect(totalSaved).toBe(30); // 4 + 5 + 3 + 4 + 5 + 4 + 5
        } else if (challenge.category === 'Dishwashing') {
          expect(totalSaved).toBe(17); // 2 + 3 + 2 + 3 + 2 + 3 + 2
        }
      });
    });

    it('should validate completion percentages', () => {
      mockChallenges.forEach(challenge => {
        const totalSaved = challenge.dailyActions.reduce((acc, action) => 
          acc + action.saved, 0);
        const completionPercentage = (totalSaved / challenge.targetSaving) * 100;

        if (challenge.category === 'Shower') {
          expect(completionPercentage).toBeCloseTo(85.71); // (30/35) * 100
        } else if (challenge.category === 'Dishwashing') {
          expect(completionPercentage).toBeCloseTo(80.95); // (17/21) * 100
        }
      });
    });
  });

  describe('Challenge Data Consistency', () => {
    it('should have consecutive days', () => {
      mockChallenges.forEach(challenge => {
        challenge.dailyActions.forEach((action, index) => {
          expect(action.day).toBe(index + 1);
        });
      });
    });

    it('should have valid date ranges', () => {
      mockChallenges.forEach(challenge => {
        const startDate = new Date(challenge.startDate);
        const endDate = new Date(challenge.endDate);
        
        // Challenge süresi 7 gün olmalı
        const dayDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
        expect(dayDiff).toBe(6); // 7 gün (0'dan başladığı için 6)

        // Her günlük aksiyon tarihi, başlangıç ve bitiş arasında olmalı
        challenge.dailyActions.forEach(action => {
          const actionDate = new Date(action.date);
          expect(actionDate >= startDate).toBe(true);
          expect(actionDate <= endDate).toBe(true);
        });
      });
    });

    it('should have reasonable saving values', () => {
      mockChallenges.forEach(challenge => {
        challenge.dailyActions.forEach(action => {
          if (challenge.category === 'Shower') {
            expect(action.saved).toBeLessThanOrEqual(5);
          } else if (challenge.category === 'Dishwashing') {
            expect(action.saved).toBeLessThanOrEqual(3);
          }
          expect(action.saved).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Challenge Progress Tracking', () => {
    it('should track daily progress correctly', () => {
      mockChallenges.forEach(challenge => {
        let runningTotal = 0;
        challenge.dailyActions.forEach(action => {
          runningTotal += action.saved;
          expect(runningTotal).toBeLessThanOrEqual(challenge.targetSaving);
        });
      });
    });

    it('should maintain category-specific limits', () => {
      const categoryLimits = {
        'Shower': 5,
        'Dishwashing': 3,
        'Laundry': 10,
        'Daily': 2
      };

      mockChallenges.forEach(challenge => {
        const limit = categoryLimits[challenge.category];
        challenge.dailyActions.forEach(action => {
          expect(action.saved).toBeLessThanOrEqual(limit);
        });
      });
    });
  });
}); 