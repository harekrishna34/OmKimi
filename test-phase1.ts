#!/usr/bin/env npx tsx
/**
 * Phase 1 Test: Memory + Auto Learning + User Modeling
 * Run: npx tsx test-phase1.ts
 */

import { MemoryManager } from './packages/memory/src/memory-manager.js';
import { AutoSkillService } from './packages/agent-core-v2/src/features/auto-learning/auto-skill-service.js';
import { UserModelingService } from './packages/agent-core-v2/src/features/user-modeling/user-modeling-service.js';
import * as os from 'node:os';
import * as path from 'node:path';

const DB_PATH = path.join(os.tmpdir(), 'kimi-test-memory.db');
const SKILLS_DIR = path.join(os.tmpdir(), 'kimi-test-skills');
const PREFS_PATH = path.join(os.tmpdir(), 'kimi-test-user-prefs.json');

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function testMemory() {
  console.log('\n🧠 TEST 1: Memory Manager (SQLite + FTS5)');
  console.log('─'.repeat(50));

  // Clean old DB
  const fs2 = await import('node:fs/promises');
  try { await fs2.unlink(DB_PATH); } catch { /* ignore */ }
  try { await fs2.unlink(DB_PATH + '-wal'); } catch { /* ignore */ }
  try { await fs2.unlink(DB_PATH + '-shm'); } catch { /* ignore */ }

  const mm = new MemoryManager({ dbPath: DB_PATH });

  // CRUD
  const mem1 = mm.remember('TypeScript best practices: use strict mode', 'fact', { sessionId: 'test-1' });
  assert('remember() returns entry with id', mem1.id > 0);
  assert('remember() stores correct content', mem1.content === 'TypeScript best practices: use strict mode');
  assert('remember() stores correct category', mem1.category === 'fact');

  const mem2 = mm.remember('User prefers dark theme', 'preference', { sessionId: 'test-1' });
  const mem3 = mm.remember('Always run tests before commit', 'pattern', { sessionId: 'test-2' });

  // getMemory
  const fetched = mm.getMemory(mem1.id);
  assert('getMemory() returns correct entry', fetched?.content === mem1.content);

  // updateMemory
  mm.updateMemory(mem1.id, { content: 'TypeScript: always use strict mode + noImplicitAny' });
  const updated = mm.getMemory(mem1.id);
  assert('updateMemory() updates content', updated?.content?.includes('noImplicitAny') ?? false);

  // listMemories
  const all = mm.listMemories();
  assert('listMemories() returns all entries', all.length === 3);

  const facts = mm.listMemories({ category: 'fact' });
  assert('listMemories() filters by category', facts.length === 1);

  // search (FTS5)
  const results = mm.recall('TypeScript');
  assert('recall() FTS5 search works', results.length > 0);
  assert('recall() returns matching entry', results[0]?.entry.content.includes('TypeScript'));

  // User preferences
  mm.trackPreference('theme', 'dark', 'ui');
  mm.trackPreference('editor', 'vim', 'tools');
  const prefs = mm.listPreferences();
  assert('trackPreference() stores preference', prefs.length === 2);
  const themePref = mm.getPreference('theme');
  assert('getPreference() returns correct value', themePref?.value === 'dark');

  // System prompt block
  const promptBlock = mm.getFullContextBlock();
  assert('getFullContextBlock() generates output', promptBlock.length > 0);
  assert('getFullContextBlock() contains memories', promptBlock.includes('Stored Memory'));
  assert('getFullContextBlock() contains preferences', promptBlock.includes('User Preferences'));

  // Stats
  const stats = mm.getStats();
  assert('getStats() returns counts', stats.memories === 3 && stats.preferences === 2);

  // Consolidation — add exact duplicates of current content
  const currentFact = mm.getMemory(mem1.id)!;
  mm.remember(currentFact.content, 'fact'); // exact duplicate
  mm.remember(currentFact.content, 'fact'); // another exact duplicate
  const before = mm.listMemories({ category: 'fact' }).length;
  assert('pre-consolidate has 3 facts', before === 3);
  mm.consolidate();
  const after = mm.listMemories({ category: 'fact' }).length;
  assert('consolidate() removes duplicates', after < before);

  mm.close();
}

async function testAutoLearning() {
  console.log('\n🎓 TEST 2: Auto Learning (Self-Skill Creation)');
  console.log('─'.repeat(50));

  const service = new AutoSkillService(SKILLS_DIR, { enabled: true });

  // Config
  const config = service.getConfig();
  assert('getConfig() returns enabled config', config.enabled === true);
  assert('getConfig() has default values', config.maxAutoSkills > 0);

  // Review turn (should return no-op for now since LLM not integrated)
  const review = await service.reviewTurn([
    { role: 'user', content: 'Help me refactor this function' },
    { role: 'assistant', content: 'Sure, let me analyze the code...' },
  ]);
  assert('reviewTurn() returns result', review !== undefined);
  assert('reviewTurn() has reasoning', typeof review.reasoning === 'string');

  // Create skill from experience
  const skillPath = await service.createSkillFromExperience({
    name: 'test-refactor-skill',
    description: 'Auto-generated refactoring skill',
    content: '# Refactoring Helper\n\nSteps:\n1. Identify code smells\n2. Apply patterns\n3. Run tests',
    sourceSession: 'test-session',
  });
  assert('createSkillFromExperience() returns path', skillPath.includes('test-refactor-skill'));
  assert('createSkillFromExperience() creates SKILL.md', skillPath.endsWith('SKILL.md'));

  // Verify file exists
  const fs = await import('node:fs/promises');
  const skillContent = await fs.readFile(skillPath, 'utf-8');
  assert('Skill file has frontmatter', skillContent.includes('auto-generated: true'));
  assert('Skill file has description', skillContent.includes('Auto-generated refactoring skill'));

  // Curator
  const report = await service.runCurator(SKILLS_DIR);
  assert('runCurator() returns report', report !== undefined);
  assert('runCurator() counts reviewed skills', report.skillsReviewed >= 1);

  console.log(`  📁 Skills dir: ${SKILLS_DIR}`);
}

async function testUserModeling() {
  console.log('\n👤 TEST 3: User Modeling (Preference Tracking)');
  console.log('─'.repeat(50));

  // Clean old prefs
  const fs2 = await import('node:fs/promises');
  try { await fs2.unlink(PREFS_PATH); } catch { /* ignore */ }

  const service = new UserModelingService({ enabled: true, maxPreferences: 100, decayRate: 0.95, storePath: PREFS_PATH });

  // Config
  const config = service.getConfig();
  assert('getConfig() returns enabled config', config.enabled === true);

  // Set preferences
  const pref1 = await service.setPreference({
    key: 'language',
    value: 'TypeScript',
    category: 'coding_style',
    confidence: 0.9,
  });
  assert('setPreference() stores preference', pref1.key === 'language');
  assert('setPreference() stores correct value', pref1.value === 'TypeScript');

  await service.setPreference({
    key: 'indentation',
    value: '2 spaces',
    category: 'coding_style',
    confidence: 0.8,
  });

  await service.setPreference({
    key: 'communication',
    value: 'Hinglish',
    category: 'communication_style',
    confidence: 1.0,
  });

  // Get preference
  const langPref = await service.getPreference('language');
  assert('getPreference() returns correct pref', langPref?.value === 'TypeScript');

  // List by category
  const codingPrefs = await service.listPreferences('coding_style');
  assert('listPreferences(category) filters correctly', codingPrefs.length === 2);

  // System prompt block
  const promptBlock = await service.getSystemPromptBlock();
  assert('getSystemPromptBlock() generates output', promptBlock.length > 0);
  assert('getSystemPromptBlock() has User Profile header', promptBlock.includes('User Profile'));
  assert('getSystemPromptBlock() shows preferences', promptBlock.includes('TypeScript'));
  assert('getSystemPromptBlock() shows confidence', promptBlock.includes('90%'));

  // Track interaction (extract preferences from events)
  await service.trackInteraction([
    { type: 'message', content: 'I prefer functional programming over OOP' },
    { type: 'message', content: 'Noted, I will use functional patterns.' },
  ]);

  console.log(`  📁 Store: ${PREFS_PATH}`);
}

async function main() {
  console.log('🚀 Phase 1 Test Suite: Memory + Auto Learning + User Modeling');
  console.log('='.repeat(60));

  await testMemory();
  await testAutoLearning();
  await testUserModeling();

  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
