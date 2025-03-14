import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert, Animated, Dimensions, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { MediaItem, Tag, getMediaItems, getMediaTags } from '../utils/database';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageView'>;

export default function ImageViewScreen({ route, navigation }: Props) {
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMediaItem();
    loadTags();
  }, []);
  
  // Fade in animation when media loads
  useEffect(() => {
    if (mediaItem && !loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [mediaItem, loading]);

  const loadMediaItem = async () => {
    setLoading(true);
    try {
      const items = await getMediaItems();
      const item = items.find(item => item.id === route.params.id);
      if (item) {
        setMediaItem(item);
      } else {
        Alert.alert('Error', 'Media item not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading media item:', error);
      Alert.alert('Error', 'Failed to load media item');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const mediaTags = await getMediaTags(route.params.id);
      setTags(mediaTags);
    } catch (error) {
      console.error('Error loading tags:', error);
      Alert.alert('Error', 'Failed to load tags');
    }
  };

  // Double tap to reset zoom
  const handleDoubleTap = () => {
    Animated.spring(fadeAnim, {
      toValue: 0.8,
      friction: 3,
      useNativeDriver: true
    }).start(() => {
      Animated.spring(fadeAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true
      }).start();
    });
  };

  if (!mediaItem) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={handleDoubleTap}
          style={styles.imageWrapper}
        >
          <Image 
            source={{ uri: mediaItem.uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>
      
      <View style={styles.tagsContainer}>
        <Text style={styles.sectionTitle}>Tags:</Text>
        <ScrollView horizontal={false} contentContainerStyle={styles.tagsList}>
          {tags.length > 0 ? tags.map(tag => (
            <View key={tag.id} style={styles.tag}>
              <Text style={styles.tagText}>{tag.name}</Text>
            </View>
          )) : (
            <Text style={styles.noTagsText}>No tags added yet</Text>
          )}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('TagManager', { mediaId: mediaItem.id })}
        >
          <Text style={styles.editButtonText}>Edit Tags</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.6,
    backgroundColor: colors.card,
    ...shadows.medium,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagsContainer: {
    padding: spacing.lg,
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600', // Using string value instead of typography.fontWeights.semiBold
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagsList: {
    flexDirection: 'row',
    flexShrink: 1,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.tagBackground,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    margin: spacing.xs,
    ...shadows.small,
  },
  tagText: {
    fontSize: typography.fontSizes.md,
    color: colors.tagText,
  },
  noTagsText: {
    color: colors.textLight,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  editButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.small,
  },
  editButtonText: {
    color: 'white',
    fontSize: typography.fontSizes.md,
    fontWeight: '600', // Using string value instead of typography.fontWeights.semiBold
  },
});
