export type Role = "STUDENT" | "MODERATOR" | "ADMIN";
export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type PostType =
  | "TEXT"
  | "IMAGE"
  | "EVENT"
  | "QUESTION"
  | "POLL"
  | "STUDY_REQUEST"
  | "PROJECT_REQUEST"
  | "COFFEE_INVITE"
  | "MOVIE_PLAN"
  | "SPORTS_INVITE";

export type EventCategory =
  | "TECH"
  | "CULTURAL"
  | "SPORTS"
  | "WORKSHOP"
  | "HACKATHON"
  | "SEMINAR"
  | "OTHER";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserSummary {
  id: string;
  name: string;
  profilePictureUrl?: string;
  college: string;
}

export interface UserProfile extends UserSummary {
  email: string;
  branch?: string;
  year?: number;
  bio?: string;
  interests: string[];
  skills: string[];
  badges: string[];
  role: Role;
  verificationStatus: VerificationStatus;
  followersCount: number;
  followingCount: number;
  banned: boolean;
  followedByCurrentUser: boolean;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
}

export interface Post {
  id: string;
  author: UserSummary;
  type: PostType;
  content?: string;
  imageUrls: string[];
  pollOptions: string[];
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  savedByCurrentUser: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  author: UserSummary;
  content: string;
  parentCommentId?: string;
  likeCount: number;
  createdAt: string;
}

export interface CommunityDto {
  id: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  memberCount: number;
  joinedByCurrentUser: boolean;
}

export interface EventDto {
  id: string;
  organizer: UserSummary;
  title: string;
  description?: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
  category: EventCategory;
  bannerUrl?: string;
  joinedCount: number;
  interestedCount: number;
  currentUserStatus?: "JOINED" | "INTERESTED" | null;
}

export interface StudyPartnerPostDto {
  id: string;
  author: UserSummary;
  subject: string;
  description?: string;
  tags: string[];
  open: boolean;
  participantCount: number;
}

export interface ProjectCardDto {
  id: string;
  author: UserSummary;
  title: string;
  description?: string;
  rolesNeeded: string[];
  open: boolean;
}

export interface FriendRequestDto {
  id: string;
  sender: UserSummary;
  receiver: UserSummary;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export interface ChatRoomDto {
  id: string;
  otherUser: UserSummary;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  otherUserOnline: boolean;
}

export interface MessageDto {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationDto {
  id: string;
  actor?: UserSummary;
  type: string;
  targetId?: string;
  message?: string;
  read: boolean;
  createdAt: string;
}
