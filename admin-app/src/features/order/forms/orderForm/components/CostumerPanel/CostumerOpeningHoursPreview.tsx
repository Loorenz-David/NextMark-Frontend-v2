import type { CostumerOperatingHours } from "@/features/costumer";
import { WEEKDAY_OPTIONS } from "@/features/costumer/forms/costumerForm/flows/costumerOperatingHours.flow";

type Props = {
 costumerOperatingHours: CostumerOperatingHours[]
}
export const OpeningHoursPreview = ({
    costumerOperatingHours
}: Props) => {

    return ( 
        <div className="flex flex-col gap-1">
            {costumerOperatingHours.map(openingHour =>{
                const date = WEEKDAY_OPTIONS[openingHour.weekday] 
                const openTime = openingHour.open_time ?? '--'
                const closeTime = openingHour.close_time ?? '--'
                const isClosed = openingHour.is_closed
                if(isClosed){
                    return(
                        <PreviewDayRow date={date.shortLabel} time={'closed'} timeColor={'text-red-400'} />
                    )
                }
                return (
                    <PreviewDayRow date={date.shortLabel} time={openTime + ' to ' + closeTime}/>
                )
            })}
            
        </div>
    );
}


const PreviewDayRow = ({
    date,
    time,
    timeColor = 'text-[var(--color-muted)]'
}:{date:string, time:string, timeColor?:string}) =>{

    return (
        <div className="grid grid-cols-[auto_1fr] gap-x-2">
            <span className=" font-semibold text-[10px] text-[var(--color-muted)]">
                {date}
            </span>
            <div className="flex justify-end">
                <span className={`text-[10px] ${timeColor} text-nowrap`}>
                    {time}
                </span>
            </div>
        </div>
    )
}


