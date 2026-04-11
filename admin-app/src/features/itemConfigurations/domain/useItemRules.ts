import type { ItemType } from '../types/itemType'
import type { ItemProperty } from '../types/itemProperty'
import type { ItemPosition } from '../types/itemPosition'
import type { ItemState } from '../types/itemState'

const matches = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase())

export const filterItemTypes = (items: ItemType[], query: string) =>
  query ? items.filter((item) => matches(item.name, query)) : items

export const filterItemProperties = (items: ItemProperty[], query: string) =>
  query ? items.filter((item) => matches(item.name, query)) : items

export const filterItemPositions = (items: ItemPosition[], query: string) =>
  query ? items.filter((item) => matches(item.name, query)) : items

export const filterItemStates = (items: ItemState[], query: string) =>
  query ? items.filter((item) => matches(item.name, query)) : items
