export type ServiceName =
  | 'organizations'
  | 'analysis'


// Define the cache tags structure
export const CACHE_TAGS = {
  organizations: {
    all: 'organizations',
  },
  analysis: {
    all: 'analysis',
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
