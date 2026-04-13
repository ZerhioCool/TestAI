export type PlanType = 'free' | 'pro' | 'pass' | 'corporativo';

export interface PlanConfig {
  maxQuizzesPerMonth: number;
  maxPagesPerPDF: number;
  maxQuestionsPerQuiz: number;
  maxPlayers: number;
  historyRetentionHours: number | null; // null = infinite
  canShare: boolean;
  aiLevel: 'basic' | 'advanced';
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    maxQuizzesPerMonth: 3,
    maxPagesPerPDF: 5,
    maxQuestionsPerQuiz: 10,
    maxPlayers: 5,
    historyRetentionHours: 24,
    canShare: false,
    aiLevel: 'basic',
  },
  pro: {
    maxQuizzesPerMonth: 999999, // Ilimitado
    maxPagesPerPDF: 40,
    maxQuestionsPerQuiz: 100, // Ilimitado (virtualmente)
    maxPlayers: 50,
    historyRetentionHours: null,
    canShare: true,
    aiLevel: 'advanced',
  },
  pass: {
    maxQuizzesPerMonth: 1, // 1 específico
    maxPagesPerPDF: 120, // Según quiz (alto por defecto)
    maxQuestionsPerQuiz: 15, // 10 del gratis + 5
    maxPlayers: 10,
    historyRetentionHours: 240, // 10 días = 24 * 10
    canShare: true,
    aiLevel: 'advanced',
  },
  corporativo: {
    maxQuizzesPerMonth: 999999,
    maxPagesPerPDF: 999,
    maxQuestionsPerQuiz: 999,
    maxPlayers: 999,
    historyRetentionHours: null,
    canShare: true,
    aiLevel: 'advanced',
  }
};

export const getPlanConfig = (plan: string | null | undefined): PlanConfig => {
  const p = (plan || 'free') as PlanType;
  return PLANS[p] || PLANS.free;
};
