import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TutorialVideo = ({ videoUrl, title, onClose }) => {
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        controls={true}
        paused={paused}
        onLoad={() => setLoading(false)}
        resizeMode="contain"
        onError={(error) => console.log('Video Error:', error)}
      />
      <TouchableOpacity 
        style={styles.playPauseButton} 
        onPress={() => setPaused(!paused)}
      >
        <Icon 
          name={paused ? 'play-arrow' : 'pause'} 
          size={32} 
          color="#fff" 
        />
      </TouchableOpacity>
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  video: {
    flex: 1,
    backgroundColor: '#000',
  },
  playPauseButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderRadius: 25,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default TutorialVideo; 