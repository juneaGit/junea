export const paths = {
  home: {
    getHref: () => '/',
  },

  auth: {
    register: {
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
    login: {
      getHref: (redirectTo?: string | null | undefined) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },

  app: {
    root: {
      getHref: () => '/app',
    },
    dashboard: {
      getHref: () => '/app',
    },
    discussions: {
      getHref: () => '/app/discussions',
    },
    discussion: {
      getHref: (id: string) => `/app/discussions/${id}`,
    },
    users: {
      getHref: () => '/app/users',
    },
    profile: {
      getHref: () => '/app/profile',
    },
    // Wedding planning pages
    planning: {
      getHref: () => '/app/planning',
    },
    budget: {
      getHref: () => '/app/budget',
    },
    guests: {
      getHref: () => '/app/guests',
    },
    seating: {
      getHref: () => '/app/seating',
    },
    venue: {
      getHref: () => '/app/venue',
    },
    catering: {
      getHref: () => '/app/catering',
    },
    music: {
      getHref: () => '/app/music',
    },
    photography: {
      getHref: () => '/app/photography',
    },
    services: {
      getHref: () => '/app/services',
    },
    dayPlanning: {
      getHref: () => '/app/day-planning',
    },
    settings: {
      getHref: () => '/app/settings',
    },
  },
  public: {
    discussion: {
      getHref: (id: string) => `/public/discussions/${id}`,
    },
  },
} as const;
