import {
  EMPTY_HOME_MOBILE_LAYERS,
  countHomeMobileLayers,
  isHomeMobileShellTab,
  isHomeMobileTabRootActive,
  resolveHomeMobileBackTarget,
} from '../homeMobileShell.domain'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runHomeMobileShellDomainTests = () => {
  {
    assert(
      resolveHomeMobileBackTarget(EMPTY_HOME_MOBILE_LAYERS) === null,
      'nothing to close at the tab root',
    )
  }

  {
    const target = resolveHomeMobileBackTarget({
      popups: 1,
      sheets: 1,
      sections: 2,
      base: true,
    })
    assert(target === 'sheet', 'a sheet opened from a popup closes before the popup')
  }

  {
    const target = resolveHomeMobileBackTarget({
      popups: 1,
      sheets: 0,
      sections: 2,
      base: true,
    })
    assert(target === 'popup', 'a popup closes before anything underneath it')
  }

  {
    assert(
      resolveHomeMobileBackTarget({ ...EMPTY_HOME_MOBILE_LAYERS, sheets: 1, sections: 1 }) ===
        'sheet',
      'a sheet opened over a page closes first',
    )
    assert(
      resolveHomeMobileBackTarget({ ...EMPTY_HOME_MOBILE_LAYERS, sections: 1, base: true }) ===
        'section',
      'a pushed section closes before the plan workspace panel',
    )
    assert(
      resolveHomeMobileBackTarget({ ...EMPTY_HOME_MOBILE_LAYERS, base: true }) === 'base',
      'the plan workspace panel is the last layer to close',
    )
  }

  {
    assert(countHomeMobileLayers(EMPTY_HOME_MOBILE_LAYERS) === 0, 'empty shell has depth 0')
    assert(
      countHomeMobileLayers({ popups: 1, sheets: 0, sections: 2, base: true }) === 4,
      'one history entry per open layer',
    )
  }

  {
    assert(
      isHomeMobileTabRootActive({ ...EMPTY_HOME_MOBILE_LAYERS, sheets: 1 }),
      'a sheet leaves the tab root interactive',
    )
    assert(
      !isHomeMobileTabRootActive({ ...EMPTY_HOME_MOBILE_LAYERS, sections: 1 }),
      'a pushed page freezes the tab root',
    )
    assert(
      !isHomeMobileTabRootActive({ ...EMPTY_HOME_MOBILE_LAYERS, base: true }),
      'the plan workspace panel freezes the tab root',
    )
    assert(
      !isHomeMobileTabRootActive({ ...EMPTY_HOME_MOBILE_LAYERS, popups: 1 }),
      'a popup freezes the tab root',
    )
  }

  {
    assert(isHomeMobileShellTab('alerts') && isHomeMobileShellTab('settings'), 'shell owns alerts and settings')
    assert(!isHomeMobileShellTab('plans') && !isHomeMobileShellTab('orders'), 'workspace owns plans and orders')
  }
}
