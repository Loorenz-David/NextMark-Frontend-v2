import { fieldInput, fieldContainer } from '@/constants/classes'
import { BasicButton } from '@/shared/buttons/BasicButton'



type OrderCaseChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export const OrderCaseChatComposer = ({
  value,
  onChange,
  onSend,
  disabled = false,
}: OrderCaseChatComposerProps) => {


  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }


  return (
    <div className="admin-glass-panel rounded-[24px] border-white/10 p-3" style={{ boxShadow: 'none' }}>
      <div className="flex items-end gap-3">
      <div className="flex-1">
        <div className={fieldContainer}>
          <textarea
            value={value}
            onChange={(event)=> onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            className={fieldInput}
            rows={2}
          />

        </div>
      </div>
      <BasicButton
        params={{
          variant: 'primary',
          onClick: onSend,
          disabled,
          ariaLabel: 'Send case message',
          className: 'h-11 rounded-[1.35rem] px-5',
        }}
      >
        Send
      </BasicButton>
      </div>
    </div>
  )
}
