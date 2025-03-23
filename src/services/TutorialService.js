const TUTORIAL_VIDEOS = {
  dishwashing: {
    url: 'https://www.youtube.com/watch?v=Rl6YOGCoZvU',
    title: 'Bulaşık Yıkamada Su Tasarrufu',
    description: 'Bulaşık yıkarken su tasarrufu yapmanın püf noktaları.',
    category: 'dishwashing'
  },
  shower: {
    url: 'https://www.youtube.com/watch?v=4MDLpVHY8LE',
    title: 'Duşta Su Tasarrufu',
    description: 'Duş alırken su tasarrufu yapmanın etkili yolları.',
    category: 'shower'
  },
  laundry: {
    url: 'https://www.youtube.com/watch?v=P9WzEoG8jfQ',
    title: 'Çamaşır Yıkamada Su Tasarrufu',
    description: 'Çamaşır yıkarken su tasarrufu yapmanın yolları.',
    category: 'laundry'
  },
  daily: {
    url: 'https://www.youtube.com/watch?v=GOLf2RbxmzE',
    title: 'Günlük Su Tasarrufu',
    description: 'Günlük hayatta su tasarrufu yapmanın pratik yolları.',
    category: 'daily'
  },
  plumbing: {
    url: 'https://www.youtube.com/watch?v=B2cQe9pTwVo',
    title: 'Tesisatta Su Tasarrufu',
    description: 'Tesisatta su tasarrufu ve bakım ipuçları.',
    category: 'plumbing'
  },
  car: {
    url: 'https://www.youtube.com/watch?v=7HIGdYy5of4',
    title: 'Araç Yıkamada Su Tasarrufu',
    description: 'Araç yıkarken su tasarrufu yapmanın yolları.',
    category: 'car'
  }
};

export const getTutorialVideo = (category) => {
  // Kategori ID'sini küçük harfe çevir ve boşlukları kaldır
  const normalizedCategory = category?.toLowerCase().replace(/\s+/g, '');
  return TUTORIAL_VIDEOS[normalizedCategory] || null;
};

export const getAllTutorialVideos = () => {
  return TUTORIAL_VIDEOS;
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