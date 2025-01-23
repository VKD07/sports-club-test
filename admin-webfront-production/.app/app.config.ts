/**
 * This file is used to configure the app
 *
 * If you have the "Cannot find name 'defineAppConfig'.ts(2304)" error
 * update the root tsconfig.json file to include the following:
 *
 *  "extends": "./.demo/.nuxt/tsconfig.json"
 *
 */

export default defineAppConfig({
  nuxtIcon: {},
  nui: {
    defaultShapes: {},
  },
  tairo: {
    title: 'Dashboard',

    collapse: {
      toolbar: {
        enabled: true,
        showTitle: true,
        showNavBurger: true,
        tools: [
          {
            component: 'ToolbarSearch',
          },
          {
            component: 'ThemeToggle',
          },
          // {
          //   component: 'ToolbarNotifications',
          // },
          {
            component: 'ToolbarAccountMenu',
          },
        ],
      },
      circularMenu: {
        enabled: true,
        tools: [
          {
            component: 'CircularThemeToggle',
            props: {
              class: 'ms-auto',
              disableTransitions: true,
              inverted: true,
            },
          },
          // {
          //   component: 'CircularMenuNotifications',
          // },
          {
            component: 'CircularLogOut',
          },
          {
            component: 'CircularAccount',
          },
        ],
      },
      navigation: {
        enabled: true,
        header: {
          component: 'NavigationHeader',
        },
        footer: {
          component: 'NavigationFooter',
        },
        items: [
          {
            name: 'Dashboard',
            icon: {
              name: 'heroicons-outline:computer-desktop',
              class: 'w-5 h-5',
            },
            to: '/dashboard',
          },
          {
            name: 'Tasks Management',
            icon: {
              name: 'heroicons-outline:clipboard-document-check',
              class: 'w-5 h-5',
            },
            activePath: '/tasks',
            children: [
              {
                name: 'Tasks',
                to: '/tasks',
              },
              {
                name: 'Categories',
                to: '/tasks/categories',
              },
              {
                name: 'Calendars',
                to: '/tasks/calendars',
              },
            ],
          },
          // {
          //   name: 'Tournaments',
          //   icon: { name: 'heroicons-outline:flag', class: 'w-5 h-5' },
          //   to: '/tournaments',
          // },

          {
            name: 'Schools',
            icon: {
              name: 'heroicons-outline:library',
              class: 'w-5 h-5',
            },
            activePath: '/schools',
            children: [
              {
                name: 'Organization',
                to: '/schools',
              },
              {
                name: 'Location',
                to: '/schools/locations',
              },
            ],
          },

          {
            name: 'Students',
            icon: { name: 'heroicons-outline:user', class: 'w-5 h-5' },
            to: '/students',
          },
          {
            name: 'Leaderboard',
            icon: {
              name: 'material-symbols:leaderboard-outline-rounded',
              class: 'w-5 h-5',
            },
            to: '/leaderboard',
          },
          {
            name: 'Performance',
            icon: {
              name: 'heroicons-outline:star',
              class: 'w-5 h-5',
            },
            activePath: '/performance',
            children: [
              {
                name: 'Student',
                to: '/performance/student',
              },
              {
                name: 'Task',
                to: '/performance/task',
              },
              // {
              //   name: 'Tournament',
              //   to: '/performance/tournament',
              // },
            ],
          },
          {
            name: 'Users',
            icon: { name: 'heroicons-outline:emoji-happy', class: 'w-5 h-5' },
            to: '/users',
          },
          {
            name: 'Support',
            icon: { name: 'heroicons-outline:inbox-in', class: 'w-5 h-5' },
            to: '/support-ticket',
          },
          {
            name: 'Media',
            icon: { name: 'heroicons-outline:camera', class: 'w-5 h-5' },
            to: '/media',
          },

          {
            name: 'Information Hub',
            icon: { name: 'heroicons-outline:light-bulb', class: 'w-5 h-5' },
            to: '/information-hub',
          },
          // {
          //   name: 'Notifications',
          //   icon: { name: 'heroicons-outline:bell', class: 'w-5 h-5' },
          //   to: '/notifications',
          // },
        ],
      },
    },

    error: {
      logo: {
        component: 'img',
        props: {
          src: '/img/illustrations/system/404-1.svg',
          class: 'relative z-20 w-full max-w-lg mx-auto',
        },
      },
    },
  },
})
