export interface MetricInterface {
  totalComments: number;
  totalPosts: number;
  totalKudos: number;
  totalSubsriptions: number;
  totalFriends: number;
  totalExperiences: number;
  totalTransactions: number;
}

export interface UserMyriadInterface {
  id: string;
  name: string;
  username: string;
  bannerImageUrl: string;
  metric: MetricInterface;
  fcmTokens: string[];
  verified: boolean;
  nonce: number;
  fullAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}
