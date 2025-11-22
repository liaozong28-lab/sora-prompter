export enum MembershipType {
  FREE = 'FREE',
  VIP = 'VIP',
  SVIP = 'SVIP'
}

export interface User {
  username: string;
  passwordHash: string;
  inviteCode: string;
  invitedBy?: string;
  credits: number;
  membership: MembershipType;
  membershipExpiry?: number;
  lastLoginDate: string;
  totalSpent: number;
  usageCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalGenerations: number;
  activeUsersToday: number;
}

export type ViewState = 'LOGIN' | 'REGISTER' | 'DASHBOARD' | 'PRICING' | 'ADMIN' | 'ADMIN_LOGIN';