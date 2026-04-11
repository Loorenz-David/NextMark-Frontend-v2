import { adjustRouteDatesToTodayApi } from '../api'

export async function adjustRouteDatesToTodayAction(routeSolutionId: number, timeZone: string) {
  const response = await adjustRouteDatesToTodayApi(routeSolutionId, { time_zone: timeZone })
  return response.data
}
