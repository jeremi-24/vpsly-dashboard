export interface PlanFeature {
  name: string;
  enabled: boolean;
  proOnly?: boolean;
}

export interface Plan {
  id: 'starter' | 'solo' | 'pro';
  name: string;
  price: number;
  maxServers: number;
  maxApps: number;
  maxDatabases: number;
  maxTeamMembers: number;
  popular?: boolean;
  features: {
    customDomains: boolean;
    autoBackups: boolean;
    whatsappAlerts: boolean;
    githubWebhooks: boolean;
  };
}

export const PLANS: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    maxServers: 1,
    maxApps: 1,
    maxDatabases: 1,
    maxTeamMembers: 1,
    features: {
      customDomains: false,
      autoBackups: false,
      whatsappAlerts: false,
      githubWebhooks: false,
    },
  },
  solo: {
    id: 'solo',
    name: 'Solo',
    price: 6,
    maxServers: 2,
    maxApps: -1, // Unlimited
    maxDatabases: -1,
    maxTeamMembers: 2,
    popular: true,
    features: {
      customDomains: true,
      autoBackups: false,
      whatsappAlerts: false,
      githubWebhooks: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 12,
    maxServers: -1,
    maxApps: -1,
    maxDatabases: -1,
    maxTeamMembers: 5,
    features: {
      customDomains: true,
      autoBackups: true,
      whatsappAlerts: true,
      githubWebhooks: true,
    },
  },
};

export const getPlanById = (id: string): Plan => PLANS[id] || PLANS.starter;
