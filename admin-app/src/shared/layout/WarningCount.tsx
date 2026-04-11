import { WarningIcon } from '@/assets/icons/index'

type Props = {
 count:number
}
export const WarningCount = ({count}: Props) => {
    return ( 
        <div className="flex gap-1 ">
            <span className="text-sm text-red-500 font-semibold">{count}</span>
            <WarningIcon className="h-5 w-5 text-red-500"/>
        </div>
    );
}