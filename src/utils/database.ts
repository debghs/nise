import * as SQLite from 'expo-sqlite';

// Open the database
let db: SQLite.SQLiteDatabase;

// Initialize the database connection
const initDbConnection = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('gallery.db');
  }
  return db;
};

export interface MediaItem {
  id: string;
  uri: string;
  type: 'image' | 'video';
  createdAt: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface MediaTag {
  mediaId: string;
  tagId: string;
}

export const initDatabase = async (): Promise<void> => {
  try {
    const database = await initDbConnection();
    
    // Create media items table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS media_items (
        id TEXT PRIMARY KEY,
        uri TEXT NOT NULL,
        type TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);

    // Create tags table
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // Create media_tags table for many-to-many relationship
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS media_tags (
        mediaId TEXT NOT NULL,
        tagId TEXT NOT NULL,
        PRIMARY KEY (mediaId, tagId),
        FOREIGN KEY (mediaId) REFERENCES media_items (id) ON DELETE CASCADE,
        FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const addMediaItem = async (item: MediaItem): Promise<void> => {
  try {
    const database = await initDbConnection();
    await database.runAsync(
      'INSERT INTO media_items (id, uri, type, createdAt) VALUES (?, ?, ?, ?)',
      [item.id, item.uri, item.type, item.createdAt]
    );
  } catch (error) {
    console.error('Failed to add media item:', error);
    throw error;
  }
};

export const getMediaItems = async (): Promise<MediaItem[]> => {
  try {
    const database = await initDbConnection();
    return await database.getAllAsync<MediaItem>(
      'SELECT * FROM media_items ORDER BY createdAt DESC'
    );
  } catch (error) {
    console.error('Failed to get media items:', error);
    throw error;
  }
};

export const addTag = async (tag: Tag): Promise<void> => {
  try {
    const database = await initDbConnection();

    // Check if tag already exists
    const existingTag = await database.getFirstAsync<Tag>(
      'SELECT id FROM tags WHERE name = ?',
      [tag.name]
    );

    if (existingTag) {
      console.log('Tag already exists, skipping insertion:', tag.name);
      return;
    }

    // Insert new tag if it doesn't exist
    await database.runAsync(
      'INSERT INTO tags (id, name) VALUES (?, ?)',
      [tag.id, tag.name]
    );
  } catch (error) {
    console.error('Failed to add tag:', error);
    throw error;
  }
};

export const getTags = async (): Promise<Tag[]> => {
  try {
    const database = await initDbConnection();
    const result = await database.getAllAsync<Tag>(
      'SELECT * FROM tags ORDER BY name'
    );
    return result;
  } catch (error) {
    console.error('Failed to get tags:', error);
    throw error;
  }
};

export const addMediaTag = async (mediaTag: MediaTag): Promise<void> => {
  try {
    const database = await initDbConnection();

    // Ensure that the media tag relationship is added correctly
    await database.runAsync(
      `INSERT OR IGNORE INTO media_tags (mediaId, tagId) VALUES (?, ?)`,
      [mediaTag.mediaId, mediaTag.tagId]
    );
  } catch (error) {
    console.error('Failed to add media tag:', error);
    throw error;
  }
};

export const getMediaTags = async (mediaId: string): Promise<Tag[]> => {
  try {
    const database = await initDbConnection();
    const result = await database.getAllAsync<Tag>(`
      SELECT tags.* FROM tags 
      INNER JOIN media_tags ON tags.id = media_tags.tagId 
      WHERE media_tags.mediaId = ?
    `, [mediaId]);
    return result;
  } catch (error) {
    console.error('Failed to get media tags:', error);
    throw error;
  }
};

export const searchMediaByTags = async (tagIds: string[]): Promise<MediaItem[]> => {
  // console.log('searchMediaByTags called with:', tagIds);
  try {
    if (tagIds.length === 0) {
      return [];
    }

    const database = await initDbConnection();
    const placeholders = tagIds.map(() => '?').join(',');

    // Using only OR logic (showing any media that has at least one of the selected tags)
    const query = `
      SELECT DISTINCT mi.* FROM media_items mi
      INNER JOIN media_tags mt ON mi.id = mt.mediaId
      WHERE mt.tagId IN (${placeholders})
    `;
    const params = [...tagIds];

    return await database.getAllAsync<MediaItem>(query, params);
  } catch (error) {
    console.error('Failed to search media by tags:', error);
    throw error;
  }
};

export const removeMediaTag = async (mediaId: string, tagId: string): Promise<void> => {
  try {
    const database = await initDbConnection();
    await database.runAsync(
      'DELETE FROM media_tags WHERE mediaId = ? AND tagId = ?',
      [mediaId, tagId]
    );
  } catch (error) {
    console.error('Failed to remove media tag:', error);
    throw error;
  }
};

export const deleteMediaItem = async (id: string): Promise<void> => {
  try {
    const database = await initDbConnection();
    await database.runAsync(
      'DELETE FROM media_items WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error('Failed to delete media item:', error);
    throw error;
  }
};

export const deleteTag = async (id: string): Promise<void> => {
  try {
    const database = await initDbConnection();
    await database.runAsync(
      'DELETE FROM tags WHERE id = ?',
      [id]
    );
    // Note: We don't need to delete from media_tags table explicitly
    // because we have ON DELETE CASCADE constraint in the database schema
  } catch (error) {
    console.error('Failed to delete tag:', error);
    throw error;
  }
};
