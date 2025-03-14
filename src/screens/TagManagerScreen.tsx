import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, FlatList, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Tag, MediaTag, getTags, addTag, addMediaTag, getMediaTags, removeMediaTag, deleteTag } from '../utils/database';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TagManager'>;

export default function TagManagerScreen({ route, navigation }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    loadTags();
    if (route.params?.mediaId) {
      loadMediaTags();
    }
  }, []);

  const loadTags = async () => {
    try {
      const allTags = await getTags();
      setTags(allTags);
    } catch (error) {
      console.error('Error loading tags:', error);
      Alert.alert('Error', 'Failed to load tags');
    }
  };

  const loadMediaTags = async () => {
    if (!route.params?.mediaId) return;
    try {
      const mediaTags = await getMediaTags(route.params.mediaId);
      setSelectedTags(mediaTags);
    } catch (error) {
      console.error('Error loading media tags:', error);
      Alert.alert('Error', 'Failed to load media tags');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      Alert.alert('Error', 'Please enter a tag name');
      return;
    }

    try {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: newTagName.trim(),
      };

      await addTag(newTag);
      setNewTagName('');
      await loadTags();
    } catch (error) {
      console.error('Error creating tag:', error);
      Alert.alert('Error', 'Failed to create tag');
    }
  };

  const handleToggleTag = async (tag: Tag) => {
    if (!route.params?.mediaId) return;

    try {
      const isSelected = selectedTags.some(t => t.id === tag.id);
      if (!isSelected) {
        const mediaTag: MediaTag = {
          mediaId: route.params.mediaId,
          tagId: tag.id,
        };
        await addMediaTag(mediaTag);
        setSelectedTags([...selectedTags, tag]);
      } else {
        await removeMediaTag(route.params.mediaId, tag.id);
        setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
      }
    } catch (error) {
      console.error('Error toggling tag:', error);
      Alert.alert('Error', 'Failed to update media tags');
    }
  };

  const handleDeleteTag = async (tag: Tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete the tag "${tag.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tag.id);
              // Remove from selected tags if it was selected
              if (selectedTags.some(t => t.id === tag.id)) {
                setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
              }
              // Reload tags list
              await loadTags();
            } catch (error) {
              console.error('Error deleting tag:', error);
              Alert.alert('Error', 'Failed to delete tag');
            }
          }
        }
      ]
    );
  };

  const renderTag = ({ item }: { item: Tag }) => {
    const isSelected = selectedTags.some(tag => tag.id === item.id);
    return (
      <View style={styles.tagContainer}>
        <TouchableOpacity 
          style={[styles.tag, isSelected && styles.selectedTag]}
          onPress={() => handleToggleTag(item)}
        >
          <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
            {item.name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteTag(item)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTagName}
          onChangeText={setNewTagName}
          placeholder="Enter new tag name"
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateTag}
        >
          <Text style={styles.addButtonText}>Add Tag</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tags}
        renderItem={renderTag}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.tagsList}
      />
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  addButtonText: {
    color: 'white',
    fontSize: typography.fontSizes.md,
    fontWeight: '600', // Using string value instead of typography.fontWeights.semiBold
  },
  tagsList: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.sm,
  },
  tag: {
    backgroundColor: colors.tagBackground,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
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
  deleteButton: {
    marginLeft: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: borderRadius.round,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: typography.fontSizes.md,
    fontWeight: '700', // Using string value instead of typography.fontWeights.bold
    lineHeight: 24,
  },
});
