type LogoutButtonProps = {
  onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  return (
    <button
      className="w-full py-3 text-left"
      onClick={onLogout}
      type="button"
    >
      <p className="text-sm font-semibold text-rose-700">Log out</p>
      <p className="mt-1 text-xs text-rose-500">
        Sign out from the current driver session.
      </p>
    </button>
  )
}
