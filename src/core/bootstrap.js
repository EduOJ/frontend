import store from '@/store'
import storage from 'store'
import {
  ACCESS_TOKEN,
  APP_LANGUAGE,
  TOGGLE_CONTENT_WIDTH,
  TOGGLE_FIXED_HEADER,
  TOGGLE_FIXED_SIDEBAR, TOGGLE_HIDE_HEADER,
  TOGGLE_LAYOUT, TOGGLE_NAV_THEME, TOGGLE_WEAK,
  TOGGLE_COLOR, TOGGLE_MULTI_TAB
} from '@/store/mutation-types'
import config from '@/config/config'

export default function Initializer () {
  store.commit(TOGGLE_LAYOUT, storage.get(TOGGLE_LAYOUT, config.layout))
  store.commit(TOGGLE_FIXED_HEADER, storage.get(TOGGLE_FIXED_HEADER, config.fixedHeader))
  store.commit(TOGGLE_FIXED_SIDEBAR, storage.get(TOGGLE_FIXED_SIDEBAR, config.fixSiderbar))
  store.commit(TOGGLE_CONTENT_WIDTH, storage.get(TOGGLE_CONTENT_WIDTH, config.contentWidth))
  store.commit(TOGGLE_HIDE_HEADER, storage.get(TOGGLE_HIDE_HEADER, config.autoHideHeader))
  store.commit(TOGGLE_NAV_THEME, storage.get(TOGGLE_NAV_THEME, config.navTheme))
  store.commit(TOGGLE_WEAK, storage.get(TOGGLE_WEAK, config.colorWeak))
  store.commit(TOGGLE_COLOR, storage.get(TOGGLE_COLOR, config.primaryColor))
  store.commit(TOGGLE_MULTI_TAB, storage.get(TOGGLE_MULTI_TAB, config.multiTab))
  store.commit('SET_TOKEN', storage.get(ACCESS_TOKEN))
  store.dispatch('GetInfo').then(data => {
    store.commit('SET_INFO', data)
  })

  store.dispatch('setLang', storage.get(APP_LANGUAGE, 'en-US'))
  // last step
}
