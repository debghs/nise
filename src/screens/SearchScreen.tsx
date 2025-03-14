import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Text, ActivityIndicator, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { MediaItem, Tag, getTags, searchMediaByTags } from '../utils/database';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTags();
  }, []);
  
  // Fade in animation when results load
  useEffect(() => {
    if (!loading && !searching) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, searching, searchResults]);

  useEffect(() => {
    if (selectedTagIds.length > 0) {
      performSearch();
    } else {
      setSearchResults([]);
      setSearching(false);
    }
  }, [selectedTagIds]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const allTags = await getTags();
      setTags(allTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setSearching(true);
    fadeAnim.setValue(0);
    
    try {
      const results = await searchMediaByTags(selectedTagIds);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching media:', error);
    } finally {
      setSearching(false);
    }
  };  

  const toggleTag = (tagId: string) => {
    // Animate the tag selection
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
    
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const renderTag = ({ item }: { item: Tag }) => {
    const isSelected = selectedTagIds.includes(item.id);
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
        onPress={() => toggleTag(item.id)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.tag, isSelected && styles.selectedTag, { transform: [{ scale }] }]}>
          <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
            {item.name}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
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
        <>
          <Text style={styles.sectionTitle}>Select Tags:</Text>
          <FlatList
            data={tags}
            renderItem={renderTag}
            keyExtractor={item => item.id}
            horizontal
            style={styles.tagsList}
            showsHorizontalScrollIndicator={false}
          />

          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Results:</Text>
            {searching ? (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                <FlatList
                  data={searchResults}
                  renderItem={renderMediaItem}
                  keyExtractor={item => item.id}
                  numColumns={3}
                  contentContainerStyle={styles.resultsList}
                />
              </Animated.View>
            ) : selectedTagIds.length > 0 ? (
              <Text style={styles.noResultsText}>No results found</Text>
            ) : (
              <Text style={styles.noResultsText}>Select tags to search</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600', // Using string value instead of typography.fontWeights.semiBold
    color: colors.text,
    marginBottom: spacing.sm,
  },
  tagsList: {
    maxHeight: 60,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.tagBackground,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    ...shadows.small,
  },
  selectedTag: {
    backgroundColor: colors.tagSelected,
  },
  tagText: {
    fontSize: typography.fontSizes.md,
    color: colors.tagText,
  },
  selectedTagText: {
    color: colors.tagTextSelected,
  },
  resultsContainer: {
    flex: 1,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  searchingText: {
    marginLeft: spacing.sm,
    color: colors.textLight,
    fontSize: typography.fontSizes.md,
  },
  noResultsText: {
    color: colors.textLight,
    fontSize: typography.fontSizes.md,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  resultsList: {
    paddingTop: spacing.sm,
  },
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
  },
  thumbnailContainer: {
    flex: 1,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    ...shadows.small,
  },
  thumbnail: {
    flex: 1,
  },
});
