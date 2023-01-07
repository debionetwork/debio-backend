export interface MatricInterface {
  totalComments: number;
  totalPosts: number;
  totalSubscriptions: number;
  totalExperiences: number;
  totalFriends: number;
  totalTransactions: number;
  totalKudos: number;
}

export interface AccountSettingInterface {
  id: string;
  accountPrivacy: string;
  socialMediaPrivacy: string;
  userId: string;
}

export interface UserDetailTimelineInterface {
  id: string;
  name: string;
  username: string;
  bannerImageURL: string;
  metric: MatricInterface;
  fcmTokens: string[];
  verified: boolean;
  nonce: number;
  fullAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  onTimeline: string;
  accountSetting: AccountSettingInterface;
}

export interface TimelineInterface {
  id: string;
  name: string;
  allowedTags: string[];
  prohibitedTags: string[];
  people: string[];
  experienceImageURL: string;
  subscribedCount: number;
  clonedCount: number;
  trendCount: number;
  visibility: string;
  selectedUserIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  user: UserDetailTimelineInterface;
}
