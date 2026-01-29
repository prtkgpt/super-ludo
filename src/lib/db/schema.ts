// Neon Database Schema for Ludo Rush
import { pgTable, serial, text, integer, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull().unique(),
  email: text('email'),
  coins: integer('coins').default(100),
  createdAt: timestamp('created_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
});

export const userStats = pgTable('user_stats', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  totalGames: integer('total_games').default(0),
  wins: integer('wins').default(0),
  losses: integer('losses').default(0),
  totalCaptures: integer('total_captures').default(0),
  powerUpsUsed: integer('power_ups_used').default(0),
  longestStreak: integer('longest_streak').default(0),
  fastestWin: integer('fastest_win'), // turns
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  winnerId: uuid('winner_id').references(() => users.id),
  playerCount: integer('player_count').notNull(),
  turnCount: integer('turn_count'),
  duration: integer('duration'), // seconds
  isRanked: boolean('is_ranked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const gamePlayers = pgTable('game_players', {
  id: serial('id').primaryKey(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  color: text('color').notNull(),
  position: integer('position'), // 1st, 2nd, 3rd, 4th
  captures: integer('captures').default(0),
  powerUpsUsed: integer('power_ups_used').default(0),
  isAI: boolean('is_ai').default(false),
});

export const leaderboard = pgTable('leaderboard', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  username: text('username').notNull(),
  wins: integer('wins').default(0),
  gamesPlayed: integer('games_played').default(0),
  totalCaptures: integer('total_captures').default(0),
  fastestWin: integer('fastest_win'),
  rank: integer('rank'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dailyRewards = pgTable('daily_rewards', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  lastClaimDate: timestamp('last_claim_date'),
  streak: integer('streak').default(0),
  totalClaimed: integer('total_claimed').default(0),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserStatsRow = typeof userStats.$inferSelect;
export type Game = typeof games.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;
