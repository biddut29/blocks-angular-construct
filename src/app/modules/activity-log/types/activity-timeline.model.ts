// Mirrors: activity-log-v2/types in React

export interface ActivityItem {
  time: string;
  category: string;
  description: string;
  /** Set when building the filtered list for stable @for track keys. */
  trackId?: string;
}

export interface ActivityGroup {
  date: string;
  items: ActivityItem[];
}
