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
    price: 5,
    maxServers: 2,
    maxApps: -1, // Unlimited
    maxDatabases: -1,
    maxTeamMembers: 2,
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
    price: 10,
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
