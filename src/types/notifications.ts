export type AppNotification = {
  id: string;
  title: string;
  /** Display-only relative time (may include Persian digits). */
  time: string;
  read: boolean;
};
