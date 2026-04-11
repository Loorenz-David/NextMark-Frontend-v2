type MenuButtonProps = {
  isOpen: boolean
  onClick: () => void
  mode: 'onMap' | 'onPage'
}

export function MenuButton({ isOpen, onClick, mode }: MenuButtonProps) {
  return (
    <button
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      className={`flex h-10 w-10 items-center justify-center    transition-transform duration-200 hover:scale-[1.02]
        ${mode == 'onMap' 
          ? 'shadow-[0_18px_36px_rgba(31,26,19,0.14)] backdrop-blur-sm rounded-full bg-[rgb(var(--bg-app-color))]/40' 
          : ''}
        `}
      onClick={onClick}
      type="button"
    >
      <span className="sr-only">{isOpen ? 'Close navigation menu' : 'Open navigation menu'}</span>
      <span className="flex flex-col gap-[0.28rem]">
        <Line/>
        <Line/>
        <Line/>
      </span>
    </button>
  )
}


const Line = () => {
  return ( 
    <span className="block h-[1px] w-5 rounded-full " 
    style={{backgroundColor:'rgb(var(--bg-strong-light))'}}
    />
   );
}
 
