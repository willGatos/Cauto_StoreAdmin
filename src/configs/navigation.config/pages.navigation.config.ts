import { PAGES_PREFIX_PATH } from '@/constants/route.constant'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { ADMIN, OWNER, SELLER_FIXED, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const pagesNavigationConfig: NavigationTree[] = [
    {
        key: 'pages',
        path: '',
        title: 'PAGES',
        translateKey: 'nav.pages.pages',
        icon: 'pages',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'pages.welcome',
                path: `${PAGES_PREFIX_PATH}/welcome/:subscriptionId`,
                title: 'Welcome',
                translateKey: 'nav.pages.welcome',
                icon: 'welcome',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'pages.accessDenied',
                path: '/access-denied',
                title: 'Access Denied',
                translateKey: 'nav.pages.accessDenied',
                icon: 'accessDenied',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default pagesNavigationConfig
