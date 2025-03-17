export const mockQuestions = [
  {
    id: 1,
    text: "Günlük duş alışkanlığınız nedir?",
    options: [
      {
        text: "Günde 1 kez duş alıyorum",
        valueTotal: 10,
        valueSaving: 5,
        type: "Task",
        category: "Shower",
        task: "Duş süresini kısalt"
      },
      {
        text: "Günde 2 kez duş alıyorum",
        valueTotal: 20,
        valueSaving: 10,
        type: "Task",
        category: "Shower",
        task: "Duş sıklığını azalt"
      }
    ]
  },
  {
    id: 2,
    text: "Bulaşık yıkama alışkanlığınız nedir?",
    options: [
      {
        text: "Bulaşık makinesini kullanıyorum",
        valueTotal: 15,
        valueSaving: 0,
        type: "Achievement",
        category: "Dishwashing"
      },
      {
        text: "Elde yıkıyorum",
        valueTotal: 45,
        valueSaving: 30,
        type: "Task",
        category: "Dishwashing",
        task: "Bulaşık makinesini tercih et"
      }
    ]
  }
]; 