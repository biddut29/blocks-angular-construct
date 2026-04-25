// ─── Map API ActivityLog rows → timeline ActivityGroup (for merging with demo data)
import { ActivityLog } from '../../../models/activity-log.model';
import { ActivityGroup, ActivityItem } from '../types/activity-timeline.model';

/** Display module label (must match `TIMELINE_MODULE_FILTER_IDS` / React categories). */
export function mapResourceToTimelineCategory(resource: string): string {
  const r = (resource || '').toLowerCase();
  if (r === 'task') return 'Task manager';
  if (r === 'auth') return 'IAM';
  if (r === 'user') return 'IAM';
  if (r === 'invoice') return 'Dashboard';
  if (r === 'file') return 'Mail';
  return resource.charAt(0).toUpperCase() + resource.slice(1).toLowerCase();
}

export function groupActivityLogsByDate(logs: ActivityLog[]): ActivityGroup[] {
  const map = new Map<string, ActivityItem[]>();
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  for (const log of sorted) {
    const d = new Date(log.createdAt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}T00:00:00.000Z`;
    const item: ActivityItem = {
      time: log.createdAt,
      category: mapResourceToTimelineCategory(log.resource),
      description: log.description,
    };
    const list = map.get(dateKey) ?? [];
    list.push(item);
    map.set(dateKey, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, items]) => ({ date, items }));
}

/** Merge static timeline groups with API-derived groups (same calendar day → one group). */
export function mergeActivityGroups(
  staticData: ActivityGroup[],
  apiGroups: ActivityGroup[]
): ActivityGroup[] {
  if (apiGroups.length === 0) return staticData;
  const map = new Map<string, ActivityItem[]>();
  const push = (g: ActivityGroup) => {
    const list = map.get(g.date) ?? [];
    list.push(
      ...g.items.map(({ time, category, description }) => ({ time, category, description }))
    );
    map.set(g.date, list);
  };
  for (const g of staticData) push(g);
  for (const g of apiGroups) push(g);
  return [...map.entries()]
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, items]) => ({
      date,
      items: [...items].sort((x, y) => new Date(y.time).getTime() - new Date(x.time).getTime()),
    }));
}
