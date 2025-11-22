import { User, MembershipType } from '../types';

const USERS_KEY = 'sora_prompter_users';
const CURRENT_USER_KEY = 'sora_prompter_current_user';
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const StorageService = {
  getUsers: (): Record<string, User> => { const data = localStorage.getItem(USERS_KEY); return data ? JSON.parse(data) : {}; },
  saveUsers: (users: Record<string, User>) => { localStorage.setItem(USERS_KEY, JSON.stringify(users)); },
  getCurrentUser: (): User | null => { const username = localStorage.getItem(CURRENT_USER_KEY); if (!username) return null; const users = StorageService.getUsers(); return users[username] || null; },
  setCurrentUser: (username: string | null) => { if (username) { localStorage.setItem(CURRENT_USER_KEY, username); } else { localStorage.removeItem(CURRENT_USER_KEY); } },
  register: (username: string, password: string, inviteCodeInput?: string): { success: boolean; message: string } => {
    const users = StorageService.getUsers();
    if (users[username]) return { success: false, message: '用户名已存在' };
    let invitedBy = undefined;
    if (inviteCodeInput) { const referrer = Object.values(users).find(u => u.inviteCode === inviteCodeInput); if (referrer) { invitedBy = referrer.username; referrer.credits += 3; users[referrer.username] = referrer; } }
    const newUser: User = { username, passwordHash: password, inviteCode: generateInviteCode(), invitedBy, credits: 5, membership: MembershipType.FREE, lastLoginDate: new Date().toISOString().split('T')[0], totalSpent: 0, usageCount: 0 };
    users[username] = newUser; StorageService.saveUsers(users); return { success: true, message: '注册成功' };
  },
  login: (username: string, password: string): { success: boolean; message: string } => {
    const users = StorageService.getUsers(); const user = users[username];
    if (!user || user.passwordHash !== password) return { success: false, message: '用户名或密码错误' };
    const today = new Date().toISOString().split('T')[0];
    if (user.lastLoginDate !== today) { user.credits += 3; user.lastLoginDate = today; StorageService.saveUsers(users); StorageService.setCurrentUser(username); return { success: true, message: `欢迎回来！每日登录 +3 积分已到账。` }; }
    StorageService.setCurrentUser(username); return { success: true, message: '登录成功' };
  },
  deductCredit: (): boolean => {
    const user = StorageService.getCurrentUser(); if (!user) return false;
    const now = Date.now();
    if (user.membership === MembershipType.SVIP) return true;
    if (user.membership === MembershipType.VIP && user.membershipExpiry && user.membershipExpiry > now) return true;
    if (user.credits > 0) { user.credits -= 1; user.usageCount += 1; const users = StorageService.getUsers(); users[user.username] = user; StorageService.saveUsers(users); StorageService.setCurrentUser(user.username); return true; }
    return false;
  },
  upgradeMembership: (type: 'VIP' | 'SVIP'): void => {
    const user = StorageService.getCurrentUser(); if (!user) return;
    const users = StorageService.getUsers(); const now = Date.now();
    if (type === 'VIP') { const duration = 20 * 24 * 60 * 60 * 1000; const currentExpiry = user.membership === MembershipType.VIP && user.membershipExpiry ? user.membershipExpiry : now; user.membership = MembershipType.VIP; user.membershipExpiry = Math.max(currentExpiry, now) + duration; user.totalSpent += 6.9; } else if (type === 'SVIP') { user.membership = MembershipType.SVIP; user.membershipExpiry = undefined; user.totalSpent += 29.9; }
    users[user.username] = user; StorageService.saveUsers(users);
  }
};