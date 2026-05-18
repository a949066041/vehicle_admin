import type { Router } from 'vue-router'
import { readSessionSnapshot, useLoginStore } from '~/store'

export function authSetup(router: Router) {
  router.beforeEach((to, _from, next) => {
    const login = useLoginStore()
    login.hydrateSessionFromStorage()
    const snap = readSessionSnapshot()
    const sessionEff = snap ?? login.session.value
    const isLogin = !!sessionEff
    const currentRole = sessionEff?.role ?? null

    if (to.path === '/register' || to.path === '/forgot-password') {
      next()
      return
    }

    if (to.path.startsWith('/h5')) {
      if (!isLogin) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      if (currentRole === '教练') {
        next({ path: '/coach' })
        return
      }
      if (currentRole === '管理员') {
        next({ path: '/back' })
        return
      }
      if (!login.currentProfile.value) {
        login.logout()
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
    }

    if (to.path.startsWith('/back')) {
      if (!isLogin) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      if (currentRole !== '管理员') {
        next(currentRole === '教练' ? '/coach' : '/h5/home')
        return
      }
    }

    if (to.path.startsWith('/coach')) {
      if (!isLogin) {
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
      if (currentRole !== '教练') {
        next(currentRole === '管理员' ? '/back' : '/h5/home')
        return
      }
    }

    if (to.path === '/login' && isLogin) {
      const r = currentRole
      next(r === '管理员' ? '/back' : r === '教练' ? '/coach' : '/h5/home')
      return
    }

    next()
  })
}
