export enum Visibility {
  Public = 'public',
  FriendOnly = 'friend',
  OnlyMe = 'private',
  Custom = 'selected_user',
}

export interface Metric {
  comments: number;
  debates: number;
  discussions: number;
  downvotes: number;
  tips: number;
  upvotes: number;
}

export interface Post {
  banned: boolean;
  createdAt: Date;
  createdBy: Date;
  id: string;
  isNSFW: boolean;
  mentions: string[];
  metric: Metric;
  originCreatedAt: Date;
  platform: string;
  selectedUserIds: string[];
  tags: string[];
  text: string;
  updatedAt: Date;
  visibility: Visibility;
}
