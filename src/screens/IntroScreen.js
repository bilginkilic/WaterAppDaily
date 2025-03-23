import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import strings from '../localization/strings';
import { getTutorialVideo, getYoutubeVideoId, getYoutubeEmbedUrl } from '../services/TutorialService';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: strings.introTitle1,
    description: strings.introDesc1,
    image: require('../assets/intro-1.png'), // Su damlası ve dünya görseli
  },
  {
    id: '2',
    title: strings.introTitle2,
    description: strings.introDesc2,
    image: require('../assets/intro-2.png'), // Kişiselleştirilmiş öneri görseli
  },
  {
    id: '3',
    title: strings.introTitle3,
    description: strings.introDesc3,
    image: require('../assets/intro-3.png'), // İlerleme ve başarı görseli
  },
];

export const IntroScreen = ({ navigation }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const introVideo = getTutorialVideo('intro');
  const videoId = introVideo ? getYoutubeVideoId(introVideo.url) : null;
  const embedUrl = videoId ? getYoutubeEmbedUrl(videoId) : null;

  const renderSlide = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      navigation.replace('Survey');
    }
  };

  const handleSkip = () => {
    navigation.replace('Survey');
  };

  const handleWatchVideo = () => {
    setShowVideo(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentSlideIndex(index);
        }}
      />

      {/* Watch Video Button */}
      <TouchableOpacity
        style={styles.watchVideoButton}
        onPress={handleWatchVideo}
      >
        <Text style={styles.watchVideoText}>İzle ve Öğren</Text>
      </TouchableOpacity>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlideIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>{strings.skip}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {currentSlideIndex === slides.length - 1 ? strings.getStarted : strings.next}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video Modal */}
      <Modal
        visible={showVideo}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowVideo(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{introVideo?.title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowVideo(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          {embedUrl && (
            <WebView
              source={{ uri: embedUrl }}
              style={styles.webview}
              allowsFullscreenVideo
              javaScriptEnabled
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 40,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BDE3FF',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2196F3',
    width: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  skipButton: {
    padding: 16,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  watchVideoButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  watchVideoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
}); 