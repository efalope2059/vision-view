import { LocalStore } from './localStore.ts'
import type { Store } from './Store.ts'

// The one place that decides which storage backend the app uses.
// Later: `export const store: Store = new ApiStore(apiBaseUrl, getToken)`
export const store: Store = new LocalStore(window.localStorage)

export type { Store }
