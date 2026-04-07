import type { NotificationType, NotificationStatus, AuditAction } from './enums';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  status: NotificationStatus;
  channel: string;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  sentAt: string | null;
  readAt: string | null;
  failedAt: string | null;
  failReason: string | null;
  createdAt: string;
}

export interface AdminActionLog {
  id: string;
  performerId: string;
  targetUserId: string | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  dataType: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
