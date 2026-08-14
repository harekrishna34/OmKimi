/**
 * `memory` domain — SQLite database manager for persistent cross-session memory.
 *
 * Uses better-sqlite3 with WAL mode for concurrent reads + single writer.
 * Schema includes FTS5 for full-text search across memory entries.
 *
 * Inspired by Hermes Agent's SessionDB pattern but adapted for Kimi Code's
 * TypeScript/DI architecture.
 */

import Database from 'better-sqlite3';

import type {
  MemoryDbOptions,
  MemoryEntry,
  MemoryEntryInput,
  SearchResult,
  SkillExperience,
  SkillExperienceInput,
  UserPreference,
  UserPreferenceInput,
} from './types.js';

const SCHEMA_VERSION = 1;

const SCHEMA_SQL = `
  -- Memory entries: facts, preferences, patterns, skills, context
  CREATE TABLE IF NOT EXISTS memory_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('fact', 'preference', 'pattern', 'skill', 'context')),
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    source_session TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_memory_entries_session ON memory_entries(session_id);
  CREATE INDEX IF NOT EXISTS idx_memory_entries_category ON memory_entries(category);
  CREATE INDEX IF NOT EXISTS idx_memory_entries_created ON memory_entries(created_at);

  -- User preferences: key-value store with confidence scoring
  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    confidence REAL NOT NULL DEFAULT 1.0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(category);

  -- Skill experiences: tracks skills created/updated/archived from experience
  CREATE TABLE IF NOT EXISTS skill_experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('created', 'updated', 'archived')),
    content TEXT NOT NULL,
    session_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_skill_experiences_name ON skill_experiences(skill_name);
  CREATE INDEX IF NOT EXISTS idx_skill_experiences_action ON skill_experiences(action);

  -- FTS5 virtual table for full-text search on memory content
  CREATE VIRTUAL TABLE IF NOT EXISTS memory_entries_fts USING fts5(
    content,
    content='memory_entries',
    content_rowid='id',
    tokenize='unicode61'
  );

  -- Triggers to keep FTS in sync
  CREATE TRIGGER IF NOT EXISTS memory_entries_ai AFTER INSERT ON memory_entries BEGIN
    INSERT INTO memory_entries_fts(rowid, content) VALUES (new.id, new.content);
  END;

  CREATE TRIGGER IF NOT EXISTS memory_entries_ad AFTER DELETE ON memory_entries BEGIN
    INSERT INTO memory_entries_fts(memory_entries_fts, rowid, content) VALUES ('delete', old.id, old.content);
  END;

  CREATE TRIGGER IF NOT EXISTS memory_entries_au AFTER UPDATE ON memory_entries BEGIN
    INSERT INTO memory_entries_fts(memory_entries_fts, rowid, content) VALUES ('delete', old.id, old.content);
    INSERT INTO memory_entries_fts(rowid, content) VALUES (new.id, new.content);
  END;

  -- Schema version tracking
  CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

export class MemoryDb {
  private readonly db: Database.Database;

  constructor(options: MemoryDbOptions) {
    this.db = new Database(options.dbPath, {
      readonly: options.readOnly ?? false,
    });

    if (!options.readOnly) {
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('busy_timeout = 5000');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('foreign_keys = ON');
    }

    this.initializeSchema();
  }

  private initializeSchema(): void {
    this.db.exec(SCHEMA_SQL);

    // Check and update schema version
    const currentVersion = this.db
      .prepare("SELECT value FROM schema_meta WHERE key = 'version'")
      .get() as { value: string } | undefined;

    if (!currentVersion) {
      this.db
        .prepare("INSERT INTO schema_meta (key, value) VALUES ('version', ?)")
        .run(String(SCHEMA_VERSION));
    }
  }

  // ─── Memory Entries ───────────────────────────────────────────────

  createMemory(input: MemoryEntryInput): MemoryEntry {
    const stmt = this.db.prepare(`
      INSERT INTO memory_entries (session_id, category, content, metadata, source_session)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.sessionId,
      input.category,
      input.content,
      JSON.stringify(input.metadata ?? {}),
      input.sourceSession ?? null,
    );

    return this.getMemory(Number(result.lastInsertRowid))!;
  }

  getMemory(id: number): MemoryEntry | undefined {
    const row = this.db
      .prepare('SELECT * FROM memory_entries WHERE id = ?')
      .get(id) as Record<string, unknown> | undefined;

    if (!row) return undefined;

    return {
      id: row['id'] as number,
      sessionId: row['session_id'] as string,
      category: row['category'] as MemoryEntry['category'],
      content: row['content'] as string,
      metadata: JSON.parse((row['metadata'] as string) ?? '{}'),
      sourceSession: row['source_session'] as string | null,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }

  updateMemory(id: number, updates: { content?: string; metadata?: Record<string, unknown> }): void {
    const sets: string[] = [];
    const values: unknown[] = [];

    if (updates.content !== undefined) {
      sets.push('content = ?');
      values.push(updates.content);
    }
    if (updates.metadata !== undefined) {
      sets.push('metadata = ?');
      values.push(JSON.stringify(updates.metadata));
    }

    if (sets.length === 0) return;

    sets.push("updated_at = datetime('now')");
    values.push(id);

    this.db.prepare(`UPDATE memory_entries SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  }

  deleteMemory(id: number): void {
    this.db.prepare('DELETE FROM memory_entries WHERE id = ?').run(id);
  }

  searchMemory(query: string, limit: number = 10): SearchResult[] {
    // Sanitize FTS5 query
    const sanitized = query
      .replace(/['"*():]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .join(' AND ');

    if (!sanitized) return [];

    try {
      const rows = this.db
        .prepare(`
          SELECT me.*, rank, snippet(memory_entries_fts, 0, '<mark>', '</mark>', '...', 32) as snippet
          FROM memory_entries_fts fts
          JOIN memory_entries me ON me.id = fts.rowid
          WHERE memory_entries_fts MATCH ?
          ORDER BY rank
          LIMIT ?
        `)
        .all(sanitized, limit) as Array<Record<string, unknown> & { rank: number; snippet: string }>;

      return rows.map((row) => ({
        entry: {
          id: row['id'] as number,
          sessionId: row['session_id'] as string,
          category: row['category'] as MemoryEntry['category'],
          content: row['content'] as string,
          metadata: JSON.parse((row['metadata'] as string) ?? '{}'),
          sourceSession: row['source_session'] as string | null,
          createdAt: row['created_at'] as string,
          updatedAt: row['updated_at'] as string,
        },
        rank: row.rank,
        snippet: row.snippet,
      }));
    } catch {
      // FTS5 query failed, fall back to LIKE
      return this.searchMemoryFallback(query, limit);
    }
  }

  private searchMemoryFallback(query: string, limit: number): SearchResult[] {
    const rows = this.db
      .prepare(`
        SELECT *, 0 as rank, content as snippet
        FROM memory_entries
        WHERE content LIKE ?
        ORDER BY created_at DESC
        LIMIT ?
      `)
      .all(`%${query}%`, limit) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      entry: {
        id: row['id'] as number,
        sessionId: row['session_id'] as string,
        category: row['category'] as MemoryEntry['category'],
        content: row['content'] as string,
        metadata: JSON.parse((row['metadata'] as string) ?? '{}'),
        sourceSession: row['source_session'] as string | null,
        createdAt: row['created_at'] as string,
        updatedAt: row['updated_at'] as string,
      },
      rank: 0,
      snippet: (row['snippet'] as string).substring(0, 200),
    }));
  }

  listMemories(
    options: { category?: string; sessionId?: string; limit?: number; offset?: number } = {},
  ): MemoryEntry[] {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (options.category) {
      conditions.push('category = ?');
      values.push(options.category);
    }
    if (options.sessionId) {
      conditions.push('session_id = ?');
      values.push(options.sessionId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    const rows = this.db
      .prepare(`SELECT * FROM memory_entries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...values, limit, offset) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: row['id'] as number,
      sessionId: row['session_id'] as string,
      category: row['category'] as MemoryEntry['category'],
      content: row['content'] as string,
      metadata: JSON.parse((row['metadata'] as string) ?? '{}'),
      sourceSession: row['source_session'] as string | null,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    }));
  }

  // ─── User Preferences ─────────────────────────────────────────────

  setPreference(input: UserPreferenceInput): UserPreference {
    const existing = this.db
      .prepare('SELECT id FROM user_preferences WHERE key = ?')
      .get(input.key) as { id: number } | undefined;

    if (existing) {
      this.db
        .prepare(`
          UPDATE user_preferences
          SET value = ?, category = ?, confidence = MAX(confidence, ?), updated_at = datetime('now')
          WHERE id = ?
        `)
        .run(input.value, input.category, input.confidence ?? 1.0, existing.id);

      return this.getPreference(input.key)!;
    }

    const result = this.db
      .prepare(
        `INSERT INTO user_preferences (key, value, category, confidence)
         VALUES (?, ?, ?, ?)`,
      )
      .run(input.key, input.value, input.category, input.confidence ?? 1.0);

    return {
      id: Number(result.lastInsertRowid),
      key: input.key,
      value: input.value,
      category: input.category,
      confidence: input.confidence ?? 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  getPreference(key: string): UserPreference | undefined {
    const row = this.db
      .prepare('SELECT * FROM user_preferences WHERE key = ?')
      .get(key) as Record<string, unknown> | undefined;

    if (!row) return undefined;

    return {
      id: row['id'] as number,
      key: row['key'] as string,
      value: row['value'] as string,
      category: row['category'] as string,
      confidence: row['confidence'] as number,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }

  listPreferences(category?: string): UserPreference[] {
    const query = category
      ? 'SELECT * FROM user_preferences WHERE category = ? ORDER BY confidence DESC'
      : 'SELECT * FROM user_preferences ORDER BY category, confidence DESC';

    const rows = (category
      ? this.db.prepare(query).all(category)
      : this.db.prepare(query).all()) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: row['id'] as number,
      key: row['key'] as string,
      value: row['value'] as string,
      category: row['category'] as string,
      confidence: row['confidence'] as number,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    }));
  }

  // ─── Skill Experiences ────────────────────────────────────────────

  recordSkillExperience(input: SkillExperienceInput): SkillExperience {
    const result = this.db
      .prepare(
        `INSERT INTO skill_experiences (skill_name, action, content, session_id)
         VALUES (?, ?, ?, ?)`,
      )
      .run(input.skillName, input.action, input.content, input.sessionId);

    return {
      id: Number(result.lastInsertRowid),
      skillName: input.skillName,
      action: input.action,
      content: input.content,
      sessionId: input.sessionId,
      createdAt: new Date().toISOString(),
    };
  }

  listSkillExperiences(options: { skillName?: string; action?: string; limit?: number } = {}): SkillExperience[] {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (options.skillName) {
      conditions.push('skill_name = ?');
      values.push(options.skillName);
    }
    if (options.action) {
      conditions.push('action = ?');
      values.push(options.action);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit ?? 50;

    const rows = this.db
      .prepare(`SELECT * FROM skill_experiences ${where} ORDER BY created_at DESC LIMIT ?`)
      .all(...values, limit) as Array<Record<string, unknown>>;

    return rows.map((row) => ({
      id: row['id'] as number,
      skillName: row['skill_name'] as string,
      action: row['action'] as SkillExperience['action'],
      content: row['content'] as string,
      sessionId: row['session_id'] as string,
      createdAt: row['created_at'] as string,
    }));
  }

  // ─── Utility ──────────────────────────────────────────────────────

  getStats(): { memories: number; preferences: number; skillExperiences: number } {
    const memories = (this.db.prepare('SELECT COUNT(*) as count FROM memory_entries').get() as { count: number }).count;
    const preferences = (this.db.prepare('SELECT COUNT(*) as count FROM user_preferences').get() as { count: number }).count;
    const skillExperiences = (this.db.prepare('SELECT COUNT(*) as count FROM skill_experiences').get() as { count: number }).count;

    return { memories, preferences, skillExperiences };
  }

  close(): void {
    this.db.close();
  }
}
