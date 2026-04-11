type Props = {
 stopOrder:number | null
 variant?: 'small' | 'normal'
}
export const StopOrderAvatar = ({
    stopOrder,
    variant = "normal"
    
}: Props) => {

    const classmap = variantMap[variant]

    return ( 
        <div
            className={`flex items-center justify-center rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgba(172,228,244,0.20)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_22px_rgba(29,74,102,0.14)]  ${classmap.containerClass}`}
        >
            <span className={`font-bold tracking-[-0.01em] text-[rgba(201,245,255,0.9)] ${classmap.text}`}>
                {stopOrder  ?? '--'}
            </span>
        </div>
    );
}

const variantMap = {
    normal:{
        containerClass:'h-7 w-7',
        text:'text-sm'
    },
    small:{
        containerClass:'h-5 w-5',
        text:'text-[10px]'
    }
}
