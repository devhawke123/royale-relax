import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

const SETTINGS_ID = 'default'

async function fetchStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: SETTINGS_ID } })
  return {
    storeName: settings?.storeName ?? 'Royale Relax',
    email: settings?.email || 'info@royalerelax.co.uk',
    phone: settings?.phone || '+44 7999 371906',
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
