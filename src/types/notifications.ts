export type AppNotificationKind = 'message' | 'system';

export type AppNotification = {
  id: string;
  kind: AppNotificationKind;
  title: string;
  body?: string;
  senderLabel?: string;
  createdAt: string;
  read: boolean;
};

export function isExpandableNotification(
  notification: AppNotification
): boolean {
  void notification;
  return false;
}
