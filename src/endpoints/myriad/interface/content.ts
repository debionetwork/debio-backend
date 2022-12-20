export interface ContentInterface {
  id: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  createdBy: string;
  prices: PriceInterface[];
  user: UserInterface;
}

export interface UserInterface {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePictureURL: string;
  bannerImageURL: string;
  bio: string;
  websiteURL: string;
  metric: any;
  fcmTokens: string[];
  verified: boolean;
  nonce: number;
  permissions: string[];
  fullAccess: boolean;
  friendIndex: any;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  onTimeline: string;
  friends: FriendInterface[];
  experiences: ExperienceInterface[];
  activityLogs: ActivityLogInterfac[];
  accountSetting: AccountSettingInterface;
  languageSetting: LanguageSettingInterface;
  notificationSetting: NotificationSettingInterface;
  people: PeopleInterface[];
  wallets: WalletInterface[];
  experience: {
    name: string;
    createdBy: Date;
    id: string;
    allowedTags: ValueInterface[];
    prohibitedTags: ValueInterface[];
    people: ValueInterface[];
    description: string;
    experienceImageURL: string;
    subscribedCount: number;
    clonedCount: number;
    trendCount: number;
    visibility: string;
    selectedUserIds: ValueInterface[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    user: ValueInterface;
    posts: ValueInterface[];
    users: ValueInterface[];
  };
  currencies: CurrenciesInterface[];
  userCurrencies: UserCurrenciesInterface[];
}

export interface UserCurrenciesInterface {
  id: ValueInterface;
  priority: ValueInterface;
  userId: ValueInterface;
  currencyId: ValueInterface;
  networkId: ValueInterface;
  user: ValueInterface;
  currency: ValueInterface;
  network: ValueInterface;
}

export interface CurrenciesInterface {
  name: ValueInterface;
  symbol: ValueInterface;
  image: ValueInterface;
  id: ValueInterface;
  decimal: ValueInterface;
  native: ValueInterface;
  referenceId: ValueInterface;
  exchangeRate: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  price: ValueInterface;
  networkId: ValueInterface;
  network: ValueInterface;
}

export interface WalletInterface {
  id: ValueInterface;
  blockchainPlatform: ValueInterface;
  networkId: ValueInterface;
  primary: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  userId: ValueInterface;
  user: ValueInterface;
  network: ValueInterface;
}

export interface PeopleInterface {
  id: ValueInterface;
  username: ValueInterface;
  platform: ValueInterface;
  originUserId: ValueInterface;
  name: ValueInterface;
  profilePictureURL: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  connectedDate: ValueInterface;
  userSocialMedia: ValueInterface;
  posts: ValueInterface;
  users: ValueInterface;
}

export interface NotificationSettingInterface {
  id: string;
  comment: boolean;
  mentions: boolean;
  friendRequests: boolean;
  tips: boolean;
  userId: string;
  user: ValueInterface;
}

export interface LanguageSettingInterface {
  id: string;
  language: string;
  userId: string;
  user: ValueInterface;
}

export interface AccountSettingInterface {
  id: string;
  accountPrivacy: string;
  socialMediaPrivacy: string;
  userId: string;
  user: ValueInterface;
}

export interface ActivityLogInterfac {
  type: ValueInterface;
  userId: ValueInterface;
  id: ValueInterface;
  referenceId: ValueInterface;
  referenceType: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  user: ValueInterface;
}

export interface ExperienceInterface {
  name: ValueInterface;
  createdBy: ValueInterface;
  id: ValueInterface;
  allowedTags: ValueInterface;
  prohibitedTags: ValueInterface;
  people: ValueInterface;
  description: ValueInterface;
  experienceImageURL: ValueInterface;
  subscribedCount: ValueInterface;
  clonedCount: ValueInterface;
  trendCount: ValueInterface;
  visibility: ValueInterface;
  selectedUserIds: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  user: ValueInterface;
  posts: ValueInterface;
  users: ValueInterface;
}

export interface FriendInterface {
  status: ValueInterface;
  requesteeId: ValueInterface;
  requestorId: ValueInterface;
  id: ValueInterface;
  totalMutual: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  requestee: ValueInterface;
  requestor: ValueInterface;
}

export interface PriceInterface {
  amount: number;
  id: string;
  currencyId: string;
  unlockableContentId: string;
  currency: CurrencyInterface;
  unlockableContent: ValueInterface;
}

export interface CurrencyInterface {
  name: ValueInterface;
  symbol: ValueInterface;
  image: ValueInterface;
  id: ValueInterface;
  decimal: ValueInterface;
  native: ValueInterface;
  referenceId: ValueInterface;
  exchangeRate: ValueInterface;
  createdAt: ValueInterface;
  updatedAt: ValueInterface;
  deletedAt: ValueInterface;
  price: ValueInterface;
  networkId: ValueInterface;
  network: ValueInterface;
}

export interface ValueInterface {
  value: string;
}
