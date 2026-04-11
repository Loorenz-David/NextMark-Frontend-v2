import { buildCostumerSearchQuery } from '@/features/costumer/flows/useCostumerSearch.flow'
import {  shouldRunCostumerQuery } from '../CostumerSearchBar'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runCostumerSearchBarLogicTests = () => {
  assert(!shouldRunCostumerQuery(''), 'Empty query should not run')
  assert(!shouldRunCostumerQuery('   '), 'Whitespace query should not run')
  assert(shouldRunCostumerQuery('martha'), 'Text query should run')

  const query = buildCostumerSearchQuery('  martha  ', 10)
  assert(query.q === 'martha', 'Query builder should trim input')
  assert(query.limit === 10, 'Query builder should keep provided limit')
}
