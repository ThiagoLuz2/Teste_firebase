import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import { auth, authStateReady } from '../firebase';
import AuthPage from '../views/AuthPage.vue';
import HomePage from '../views/HomePage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/auth',
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthPage,
  },
  {
    path: '/home',
    name: 'Welcome',
    component: HomePage,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  try {
    await authStateReady;
  } catch (error) {
    console.error('Não foi possível restaurar a sessão do Firebase Authentication.', error);
    return '/auth';
  }

  if (to.meta.requiresAuth && !auth.currentUser) {
    return '/auth';
  }

  if (to.name === 'Auth' && auth.currentUser) {
    return '/home';
  }

  return true;
});

export default router;
