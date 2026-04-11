import { TimeRangeCard } from "./TimeRangeCard"

type Props ={
    containerClass?: string
    dateLabelClass?: string
    timeContainerClass?:string
    iconClass?: string
    textClass?: string
    from:string
    to:string
    dateLabel:string
}

export const  DateRangeCard = (props:Props) => {
    let { dateLabel, dateLabelClass, containerClass, ...rest } = props
    return ( 
        <div className={`flex flex-col  ${containerClass ?? defaultContainerClass}`}>
            <span className={dateLabelClass ?? defaultDateLabelClass}>
                {dateLabel}
            </span>
            <TimeRangeCard {...rest}/>
        </div>
     );
}
 
const defaultContainerClass = "gap-2 "
const defaultDateLabelClass = "font-bold text-xs"