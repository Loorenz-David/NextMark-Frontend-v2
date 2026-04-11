import { formatDateRangeInTeamTimeZone } from '@/app/utils/teamTimeZone'

type FormatRouteDateRangeDependencies = {
  startDate: string | null
  endDate: string | null
}

export function formatRouteDateRange({
  startDate,
  endDate,
}: FormatRouteDateRangeDependencies) {
  return formatDateRangeInTeamTimeZone({
    startDate,
    endDate,
    locale: 'en-US',
  })
}
