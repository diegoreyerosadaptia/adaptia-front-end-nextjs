export type ServiceName =
  | 'organizations'
  | 'analysis'
  | 'users'
  | 'cupones'


// Define the cache tags structure
export const CACHE_TAGS = {
  organizations: {
    all: "organizations:all",
    page: (page: string, limit: string) => `organizations:page:${page}:limit:${limit}`,
  },
  analysis: {
    all: 'analysis',
  },
  users: {
    all: 'users',
  },
  cupones: {
    all: 'cupones',
  },
} as const;

// Helper function to get cache tag
export const getCacheTag = <T extends ServiceName>(
  service: T,
  tag: keyof (typeof CACHE_TAGS)[T],
  ...params: string[]
): string => {
  const cacheTag = CACHE_TAGS[service][tag];
  if (typeof cacheTag === 'function') {
    return cacheTag(...params);
  }
  return cacheTag as string;
};
