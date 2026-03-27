import { pgTable, text, timestamp, uuid, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  plan: text("plan").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  quizzesThisMonth: integer("quizzes_this_month").default(0),
  role: text("role"),
  purpose: text("purpose"),
  termsAccepted: boolean("terms_accepted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const quizzesTable = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => usersTable.id), // Nullable for anonymous quizzes
  title: text("title").notNull(),
  sourceLang: text("source_lang").default("es"),
  questionCount: integer("question_count").notNull().default(0),
  timeLimitSec: integer("time_limit_sec").default(30),
  isPublic: boolean("is_public").default(false),
  playCount: integer("play_count").default(0),
  sourceFileUrl: text("source_file_url"),
  shareToken: text("share_token").notNull().unique(),
  pinCode: text("pin_code").unique(),
  isUnlocked: boolean("is_unlocked").default(false), // Micro-transacción atada al quiz
  maxGuestPlayers: integer("max_guest_players").default(0), // Límite para pase de 1 uso
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const questionsTable = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .references(() => quizzesTable.id, { onDelete: "cascade" })
    .notNull(),
  orderIndex: integer("order_index").notNull(),
  type: text("type").notNull(), // multiple_choice, true_false
  questionText: text("question_text").notNull(),
  imageUrl: text("image_url"),
  options: jsonb("options"), // Array of { id, text, imageUrl? }
  correctAnswer: jsonb("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(100),
});

export const quizSessionsTable = pgTable("quiz_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .references(() => quizzesTable.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => usersTable.id),
  anonymousName: text("anonymous_name"),
  score: integer("score").default(0),
  maxScore: integer("max_score").notNull(),
  answers: jsonb("answers").notNull(), // Array of user answers
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
  timeSpentSec: integer("time_spent_sec"),
});
export const liveSessionsTable = pgTable("live_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .references(() => quizzesTable.id, { onDelete: "cascade" })
    .notNull(),
  hostId: uuid("host_id").references(() => usersTable.id),
  status: text("status").default("waiting"), // waiting, playing, finished
  currentQuestionIndex: integer("current_question_index").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const multiplayerSessionsTable = pgTable("multiplayer_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").references(() => quizzesTable.id, { onDelete: "cascade" }).notNull(),
  hostId: uuid("host_id").references(() => usersTable.id, { onDelete: "cascade" }).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
  playersCount: integer("players_count").default(0),
  leaderboard: jsonb("leaderboard"), // { [playerName: string]: number }
});
