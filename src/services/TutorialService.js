import questions from '../data/questions';

export const getTutorialVideo = (questionId) => {
  const question = questions.find(q => q.id === questionId);
  if (!question || !question.content) return null;

  return {
    url: question.content.video || null,
    title: question.content.message || '',
    description: question.content.additionalInfo || '',
    category: question.category
  };
};

export const getAllTutorialVideos = () => {
  return questions
    .filter(q => q.content?.video)
    .map(q => ({
      url: q.content.video,
      title: q.content.message || '',
      description: q.content.additionalInfo || '',
      category: q.category,
      questionId: q.id
    }));
};

export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const getYoutubeEmbedUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}; 