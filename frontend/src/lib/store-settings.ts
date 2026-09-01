import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

const SETTINGS_ID = 'default'

const DEFAULT_SETTINGS = {
  storeName: 'Royale Relax',
  email: 'info@royalerelax.co.uk',
  phone: '+44 7999 371906',
}

async function fetchStoreSettings() {
  try {
    const settings = await prisma.storeSettings.findUnique({ where: { id: SETTINGS_ID } })
    return {
      storeName: settings?.storeName ?? DEFAULT_SETTINGS.storeName,
      email: settings?.email || DEFAULT_SETTINGS.email,
      phone: settings?.phone || DEFAULT_SETTINGS.phone,
    }
  } catch (error) {
    // The DB may be unreachable at build time (e.g. prerendering /_not-found on
    // Vercel). Fall back to defaults so the build doesn't fail; real requests
    // will hit the DB again once the cache entry expires / is revalidated.
    console.error('getStoreSettings: falling back to defaults', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Storefront-facing store contact details, admin-editable at /admin/settings.
 * Cached (tag: 'store-settings') so every page render doesn't hit the DB —
 * the admin settings PUT route calls revalidateTag('store-settings') on save
 * so a change shows up on the storefront right away.
 */
export const getStoreSettings = unstable_cache(fetchStoreSettings, ['store-settings'], {
  tags: ['store-settings'],
})
