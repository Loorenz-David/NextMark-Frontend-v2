import { resolveHomeDesktopTracks } from '../homeDesktopLayout.domain'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runHomeDesktopLayoutDomainTests = () => {
  {
    const tracks = resolveHomeDesktopTracks({
      viewMode: 'rail',
      isPlanVisible: true,
      isMapVisible: true,
      planContainerView: 'calendar',
      railColumnWidth: 450,
    })
    assert(
      tracks.planColumnWidth === 'calc(100vw - 320px - 450px)',
      'rail calendar view should leave the map its fixed rail',
    )
    assert(tracks.mapRowHeight === 100 && tracks.planRowHeight === 0, 'rail mode has no plan row')
    assert(tracks.canTogglePlan && tracks.canToggleMap, 'both toggles available when both visible')
  }

  {
    const tracks = resolveHomeDesktopTracks({
      viewMode: 'rail',
      isPlanVisible: true,
      isMapVisible: true,
      planContainerView: 'list',
      railColumnWidth: 450,
    })
    assert(tracks.planColumnWidth === 450, 'rail list view keeps the fixed plan column')
  }

  {
    const list = resolveHomeDesktopTracks({
      viewMode: 'rail',
      isPlanVisible: true,
      isMapVisible: false,
      planContainerView: 'list',
      railColumnWidth: 450,
    })
    const calendar = resolveHomeDesktopTracks({
      viewMode: 'rail',
      isPlanVisible: true,
      isMapVisible: false,
      planContainerView: 'calendar',
      railColumnWidth: 550,
    })
    assert(
      list.planColumnWidth === 'calc(100vw - 450px)',
      'folded map hands the whole center to the plan column (list)',
    )
    assert(
      calendar.planColumnWidth === 'calc(100vw - 550px)',
      'folded map hands the whole center to the plan column (calendar, order overlay open)',
    )
    assert(!list.canTogglePlan, 'plan cannot fold while the map is folded')
    assert(list.canToggleMap, 'map can be unfolded while the plan is visible')
  }

  {
    const tracks = resolveHomeDesktopTracks({
      viewMode: 'rail',
      isPlanVisible: false,
      isMapVisible: true,
      planContainerView: 'calendar',
      railColumnWidth: 450,
    })
    assert(tracks.planColumnWidth === 0, 'folded plan collapses its column')
    assert(!tracks.canToggleMap, 'map cannot fold while the plan is folded')
    assert(tracks.canTogglePlan, 'plan can be unfolded while the map is visible')
  }

  {
    const tracks = resolveHomeDesktopTracks({
      viewMode: 'split',
      isPlanVisible: true,
      isMapVisible: true,
      planContainerView: 'calendar',
      railColumnWidth: 450,
    })
    assert(tracks.planColumnWidth === 0, 'split mode has no plan column')
    assert(tracks.mapRowHeight === 50 && tracks.planRowHeight === 50, 'split mode shares the center')
  }

  {
    const tracks = resolveHomeDesktopTracks({
      viewMode: 'split',
      isPlanVisible: true,
      isMapVisible: false,
      planContainerView: 'calendar',
      railColumnWidth: 450,
    })
    assert(tracks.mapRowHeight === 0 && tracks.planRowHeight === 100, 'folded map gives the timeline full height')
    assert(!tracks.canTogglePlan, 'plan cannot fold in split mode while the map is folded')
  }

  {
    const tracks = resolveHomeDesktopTracks({
      viewMode: 'split',
      isPlanVisible: false,
      isMapVisible: true,
      planContainerView: 'calendar',
      railColumnWidth: 450,
    })
    assert(tracks.mapRowHeight === 100 && tracks.planRowHeight === 0, 'folded plan gives the map full height')
    assert(!tracks.canToggleMap, 'map cannot fold in split mode while the plan is folded')
  }
}
