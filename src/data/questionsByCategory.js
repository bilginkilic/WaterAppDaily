import questions from './questions';
import { categoryIds } from './categories';

// Her kategori için soruları grupla
export const questionsByCategory = Object.values(categoryIds).reduce((acc, categoryId) => {
  // O kategoriye ait tüm soruları filtrele
  acc[categoryId] = questions.filter(q => q.category === categoryId);
  return acc;
}, {});

// Kategori başına soru sayılarını hesapla
export const questionCountByCategory = Object.entries(questionsByCategory).reduce((acc, [categoryId, questions]) => {
  acc[categoryId] = questions.length;
  return acc;
}, {});

// Kategori başına maksimum tasarruf potansiyelini hesapla
export const maxSavingsByCategory = Object.entries(questionsByCategory).reduce((acc, [categoryId, questions]) => {
  acc[categoryId] = questions.reduce((total, question) => {
    const maxSaving = Math.max(...question.options.map(opt => opt.valueSaving || 0));
    return total + maxSaving;
  }, 0);
  return acc;
}, {});

// Yardımcı fonksiyonlar
export const getCategoryQuestions = (categoryId) => questionsByCategory[categoryId] || [];
export const getCategoryQuestionCount = (categoryId) => questionCountByCategory[categoryId] || 0;
export const getCategoryMaxSavings = (categoryId) => maxSavingsByCategory[categoryId] || 0; 