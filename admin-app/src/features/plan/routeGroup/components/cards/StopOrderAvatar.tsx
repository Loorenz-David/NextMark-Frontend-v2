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
            className={`flex items-center justify-center rounded-full border border-[rgb(var(--color-light-blue-r),0.22)] bg-[rgba(172,228,244,0.20)] shadow-[var(--shadow-button-stop-avatar)]  ${classmap.containerClass}`}
        >
            <span className={`font-bold tracking-[-0.01em] text-[var(--stop-order-avatar-ink)] ${classmap.text}`}>
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
