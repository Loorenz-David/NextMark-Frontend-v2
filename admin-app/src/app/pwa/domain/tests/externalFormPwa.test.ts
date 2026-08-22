import {
  EXTERNAL_FORM_MANIFEST_CONTRACT,
  EXTERNAL_FORM_MANIFEST_PATH,
  EXTERNAL_FORM_PATH,
  isExternalFormPath,
  resolvePwaHeadState,
} from '../externalFormPwa'
import {
  createManagedHead,
  type ManagedHeadPort,
  type ManagedHeadRecord,
  type ManagedHeadTag,
} from '../managedHead'
import {
  isContainmentArmed,
  resolveContainmentRedirect,
} from '../standaloneContainment'
import { isStandaloneDisplay } from '../standaloneDisplay'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

/** An in-memory stand-in for `document.head`, ordered like the real one. */
const createFakeHeadPort = (initialTitle: string) => {
  let records: ManagedHeadRecord[] = []
  let title = initialTitle

  const port: ManagedHeadPort = {
    list: () => records,
    create: (tag: ManagedHeadTag) => {
      records = [
        ...records,
        {
          key: tag.key,
          tagName: tag.tagName,
          attributes: { ...tag.attributes },
        },
      ]
    },
    update: (key, attributes) => {
      records = records.map((record) =>
        record.key === key ? { ...record, attributes: { ...attributes } } : record,
      )
    },
    remove: (key) => {
      records = records.filter((record) => record.key !== key)
    },
    getTitle: () => title,
    setTitle: (next) => {
      title = next
    },
  }

  return {
    port,
    keys: () => records.map((record) => record.key),
    find: (key: string) => records.find((record) => record.key === key) ?? null,
    title: () => title,
  }
}

export const runExternalFormPwaTests = () => {
  // 1. The exact form route activates the install metadata.
  {
    const state = resolvePwaHeadState(EXTERNAL_FORM_PATH)
    assert(
      state.tags.length > 0,
      '/external-form should advertise the install metadata',
    )
    assert(
      state.title === 'Customer Form',
      '/external-form should carry its own document title',
    )

    const manifest = state.tags.find((tag) => tag.key === 'manifest')
    assert(
      manifest?.attributes.href === EXTERNAL_FORM_MANIFEST_PATH,
      'the manifest link should point at the external-form manifest',
    )
    assert(
      state.tags.some(
        (tag) =>
          tag.attributes.name === 'apple-mobile-web-app-capable' &&
          tag.attributes.content === 'yes',
      ),
      'the legacy Apple standalone flag should be present, so a manifest that fails to load cannot cost standalone mode',
    )
    assert(
      state.tags.some((tag) => tag.attributes.rel === 'apple-touch-icon'),
      'an apple-touch-icon should be declared, or iOS installs a screenshot of the page',
    )
  }

  // 2. Child routes of the form activate it too.
  {
    assert(
      isExternalFormPath('/external-form/step/2'),
      'a child of the form route belongs to the form route family',
    )
    assert(
      resolvePwaHeadState('/external-form/step/2').tags.length > 0,
      '/external-form/... should advertise the install metadata',
    )
  }

  // 3. Ordinary admin routes advertise nothing — including a route that merely
  //    starts with the same characters.
  {
    for (const pathname of [
      '/',
      '/settings/external-form',
      '/auth/login',
      '/external-form-archive',
    ]) {
      const state = resolvePwaHeadState(pathname)
      assert(
        state.tags.length === 0 && state.title === null,
        `${pathname} must not advertise the external-form manifest`,
      )
    }
  }

  // 4. The manifest contract is standalone and starts on the form.
  {
    assert(
      EXTERNAL_FORM_MANIFEST_CONTRACT.display === 'standalone',
      'the installed app must run without browser chrome',
    )
    assert(
      EXTERNAL_FORM_MANIFEST_CONTRACT.start_url === EXTERNAL_FORM_PATH,
      'the installed app must launch straight into the form',
    )
    assert(
      isExternalFormPath(EXTERNAL_FORM_MANIFEST_CONTRACT.start_url),
      'start_url must sit inside the route family the metadata is scoped to',
    )
    assert(
      EXTERNAL_FORM_MANIFEST_CONTRACT.start_url.startsWith(
        EXTERNAL_FORM_MANIFEST_CONTRACT.scope,
      ),
      'start_url must be within scope, or the manifest is invalid',
    )
    // Scope is the route family, not the admin console. The literal type makes
    // this a compile-time fact here; `check:external-form-pwa` is what asserts
    // the same of the static manifest file the browser actually fetches.
    assert(
      EXTERNAL_FORM_MANIFEST_CONTRACT.scope === EXTERNAL_FORM_PATH,
      'scope must be the external-form route family',
    )
  }

  // 6. Route transitions leave no stale head state behind.
  {
    const head = createFakeHeadPort('delivery app')
    const managed = createManagedHead(head.port)

    managed.apply(resolvePwaHeadState('/external-form'))
    const installedKeys = head.keys()
    assert(installedKeys.includes('manifest'), 'the manifest tag should be written')
    assert(head.title() === 'Customer Form', 'the title should switch on the form route')

    // Navigating within the family must not churn the tags.
    managed.apply(resolvePwaHeadState('/external-form/step/2'))
    assert(
      head.keys().join() === installedKeys.join(),
      'moving between form routes should leave the head untouched',
    )

    // Leaving the family must take every tag back out and restore the title.
    managed.apply(resolvePwaHeadState('/settings'))
    assert(
      head.keys().length === 0,
      'an admin route must not inherit the form install metadata',
    )
    assert(
      head.title() === 'delivery app',
      'the document title should be handed back as it was found',
    )

    // Re-entering rebuilds it, and unmounting cleans up again.
    managed.apply(resolvePwaHeadState('/external-form'))
    assert(head.keys().length === installedKeys.length, 're-entry should restore the metadata')
    managed.clear()
    assert(head.keys().length === 0, 'unmount should clear the metadata')
    assert(head.title() === 'delivery app', 'unmount should restore the original title')
  }

  // Reconciliation patches a changed slot in place rather than duplicating it.
  {
    const head = createFakeHeadPort('delivery app')
    const managed = createManagedHead(head.port)
    const tag = (content: string): ManagedHeadTag => ({
      key: 'theme-color',
      tagName: 'meta',
      attributes: { name: 'theme-color', content },
    })

    managed.apply({ tags: [tag('#efe7d7')], title: null })
    managed.apply({ tags: [tag('#000000')], title: null })

    assert(head.keys().length === 1, 'a changed tag should be patched, not duplicated')
    assert(
      head.find('theme-color')?.attributes.content === '#000000',
      'the patched tag should carry the new value',
    )
  }

  // Standalone detection answers for iPad Safari, not only Chromium.
  {
    assert(
      isStandaloneDisplay({
        navigatorStandalone: true,
        matchesDisplayMode: undefined,
      }),
      'iOS reports standalone through navigator.standalone, which may be the only signal',
    )
    assert(
      isStandaloneDisplay({
        navigatorStandalone: undefined,
        matchesDisplayMode: (query) => query === '(display-mode: standalone)',
      }),
      'Chromium reports standalone through the display-mode media feature',
    )
    assert(
      !isStandaloneDisplay({
        navigatorStandalone: false,
        matchesDisplayMode: () => false,
      }),
      'a browser tab is not standalone',
    )
    assert(
      !isStandaloneDisplay({
        navigatorStandalone: undefined,
        matchesDisplayMode: (query) => query === '(display-mode: minimal-ui)',
      }),
      'minimal-ui still draws browser chrome and must not count as standalone',
    )
  }

  // Containment: armed only for a standalone launch into the form.
  {
    assert(
      isContainmentArmed({ standalone: true, launchPathname: '/external-form' }),
      'a standalone launch into the form should arm containment',
    )
    assert(
      !isContainmentArmed({ standalone: false, launchPathname: '/external-form' }),
      'a browser tab on the form route must not be contained',
    )
    assert(
      !isContainmentArmed({ standalone: true, launchPathname: '/' }),
      'a standalone launch elsewhere is not the form app',
    )

    assert(
      resolveContainmentRedirect({ armed: false, pathname: '/settings' }) === null,
      'containment must be inert when disarmed',
    )
    assert(
      resolveContainmentRedirect({ armed: true, pathname: '/external-form/step/2' }) ===
        null,
      'navigation inside the form family must behave normally',
    )
    assert(
      resolveContainmentRedirect({ armed: true, pathname: '/settings' }) ===
        EXTERNAL_FORM_PATH,
      'an admin route must be replaced back to the form',
    )
    assert(
      resolveContainmentRedirect({ armed: true, pathname: '/auth/login' }) === null,
      'the login route must be reachable, or the ProtectedRoute redirect and containment loop forever',
    )
  }
}
