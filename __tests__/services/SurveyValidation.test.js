import { mockQuestions } from '../../src/__mocks__/questions';

describe('Survey Answer Validation', () => {
  describe('Survey Question Structure', () => {
    it('should have valid question structure', () => {
      mockQuestions.forEach(question => {
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('text');
        expect(question).toHaveProperty('options');
        expect(Array.isArray(question.options)).toBe(true);
      });
    });

    it('should have valid options structure', () => {
      mockQuestions.forEach(question => {
        question.options.forEach(option => {
          expect(option).toHaveProperty('text');
          
          // Eğer bir değer varsa, sayı olmalı
          if (option.valueSaving !== undefined) {
            expect(typeof option.valueSaving).toBe('number');
          }
          if (option.valueTotal !== undefined) {
            expect(typeof option.valueTotal).toBe('number');
          }

          // Task tipi cevaplar için gerekli alanlar
          if (option.type === 'Task') {
            expect(option).toHaveProperty('task');
            expect(option).toHaveProperty('category');
          }
        });
      });
    });
  });

  describe('Survey Answer Processing', () => {
    const mockAnswers = [
      {
        questionId: 1,
        answer: {
          text: "Günde 2 kez duş alıyorum",
          valueTotal: 20,
          valueSaving: 10,
          type: 'Task',
          category: 'Shower',
          task: 'Duş süresini kısalt'
        }
      },
      {
        questionId: 2,
        answer: {
          text: "Bulaşıkları elde yıkıyorum",
          valueTotal: 45,
          valueSaving: 15,
          type: 'Task',
          category: 'Dishwashing',
          task: 'Bulaşık makinesini tercih et'
        }
      }
    ];

    it('should calculate correct total water usage', () => {
      const totalUsage = mockAnswers.reduce((acc, answer) => 
        acc + (answer.answer.valueTotal || 0), 0);
      
      expect(totalUsage).toBe(65); // 20L + 45L
    });

    it('should calculate correct potential savings', () => {
      const potentialSavings = mockAnswers.reduce((acc, answer) => 
        acc + (answer.answer.valueSaving || 0), 0);
      
      expect(potentialSavings).toBe(25); // 10L + 15L
    });

    it('should identify valid improvement areas', () => {
      const improvementAreas = mockAnswers
        .filter(answer => answer.answer.type === 'Task')
        .map(answer => answer.answer.category);

      expect(improvementAreas).toContain('Shower');
      expect(improvementAreas).toContain('Dishwashing');
      expect(improvementAreas.length).toBe(2);
    });

    it('should validate task assignments', () => {
      const tasks = mockAnswers
        .filter(answer => answer.answer.type === 'Task')
        .map(answer => ({
          category: answer.answer.category,
          task: answer.answer.task,
          potentialSaving: answer.answer.valueSaving
        }));

      tasks.forEach(task => {
        expect(task).toHaveProperty('category');
        expect(task).toHaveProperty('task');
        expect(task).toHaveProperty('potentialSaving');
        expect(typeof task.potentialSaving).toBe('number');
        expect(task.potentialSaving).toBeGreaterThan(0);
      });
    });
  });

  describe('Survey Results Consistency', () => {
    it('should have consistent water usage values across questions', () => {
      mockQuestions.forEach(question => {
        question.options.forEach(option => {
          if (option.valueTotal !== undefined) {
            // Su kullanım değerleri pozitif olmalı
            expect(option.valueTotal).toBeGreaterThanOrEqual(0);
            
            // Tasarruf değeri, toplam kullanımdan büyük olmamalı
            if (option.valueSaving !== undefined) {
              expect(option.valueSaving).toBeLessThanOrEqual(option.valueTotal);
            }
          }
        });
      });
    });

    it('should have valid category assignments', () => {
      const validCategories = ['Shower', 'Dishwashing', 'Laundry', 'Daily'];
      
      mockQuestions.forEach(question => {
        question.options.forEach(option => {
          if (option.category) {
            expect(validCategories).toContain(option.category);
          }
        });
      });
    });
  });
}); 