import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';
import * as MediaLibrary from 'expo-media-library';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { MediaItem, addMediaItem, getMediaItems } from '../utils/database';

type Props = NativeStackScreenProps<RootStackParamList, 'Gallery'>;

export default function GalleryScreen({ navigation }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMedia();
  }, []);
  
  // Fade in animation when media loads
  useEffect(() => {
    if (media.length > 0 && !loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [media, loading]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }

      const existingMedia = await getMediaItems();
      setMedia(existingMedia);

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video'],
        first: 50,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      for (const asset of assets) {
        const newItem: MediaItem = {
          id: asset.id,
          uri: asset.uri,
          type: asset.mediaType === 'photo' ? 'image' : 'video',
          createdAt: asset.creationTime || Date.now(),
        };

        if (!existingMedia.find(item => item.id === asset.id)) {
          await addMediaItem(newItem);
        }
      }

      const updatedMedia = await getMediaItems();
      setMedia(updatedMedia);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: MediaItem }) => {
    const scale = new Animated.Value(1);
    
    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        friction: 8,
        useNativeDriver: true
      }).start();
    };
    
    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true
      }).start();
    };

    return (
      <TouchableOpacity 
        style={styles.mediaItem}
        onPress={() => navigation.navigate('ImageView', { id: item.id })}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.9}
      >
        <Animated.View style={[styles.thumbnailContainer, { transform: [{ scale }] }]}>
          <Image 
            source={{ uri: item.uri }}
            style={styles.thumbnail}
          />
          {item.type === 'video' && (
            <View style={styles.videoIndicator}>
              <View style={styles.videoIcon} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={media}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const itemSize = width / 3 - spacing.sm * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: spacing.xs,
  },
  mediaItem: {
    margin: spacing.xs,
  },
  thumbnailContainer: {
    width: itemSize,
    height: itemSize,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    ...shadows.small,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 0,
    borderBottomWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'white',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: 2,
  },
});
