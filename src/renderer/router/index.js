import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/splash',
    //   name: 'landing-page',
    //   component: require('@/components/LandingPage').default
    // },
    {
      path: '/',
      name: 'login',
      component: require('@/components/LoginPage').default
    },
    {
      path: '/splash',
      name: 'loading',
      component: require('@/components/LoadingWindow').default
    },
    {
      path: '/home',
      name: 'home',
      component: require('@/components/HomePage').default,
      children: [
        {
          path: 'main',
          name: 'home-main',
          component: require('@/components/HomePage/HomeMain').default
        },
        {
          path: 'recognition',
          name: 'home-recognition',
          component: require('@/components/HomePage/Recognition').default
        },
        {
          path: 'counting',
          name: 'home-counting',
          component: require('@/components/HomePage/Counting').default
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
