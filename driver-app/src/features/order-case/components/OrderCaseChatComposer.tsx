type OrderCaseChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending?: boolean
}

export function OrderCaseChatComposer({
  value,
  onChange,
  onSend,
  isSending = false,
}: OrderCaseChatComposerProps) {
  return (
    <div className="border-t border-white/8 bg-[rgb(var(--bg-app-color))] px-5 pb-5 pt-4">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-3">
        <textarea
          className="min-h-20 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write a message"
          value={value}
        />
        <div className="mt-3 flex justify-end">
          <button
            className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
            disabled={isSending || !value.trim()}
            onClick={onSend}
            type="button"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
