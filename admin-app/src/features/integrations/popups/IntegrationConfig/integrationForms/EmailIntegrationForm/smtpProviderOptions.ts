import type { ReactNode } from 'react'

export type SmtpProviderKey =
  | 'smtp.gmail.com'
  | 'smtp.office365.com'
  | 'smtp.mail.yahoo.com'
  | 'smtp.mail.me.com'
  | 'smtp.zoho.com'
  | 'smtp.fastmail.com'
  | 'mail.gmx.com'
  | '127.0.0.1'

export type SmtpProviderOption = {
  icon?: ReactNode
  label: string
  value: SmtpProviderKey
}

export const SMTP_PROVIDER_OPTIONS: SmtpProviderOption[] = [
  { label: 'Gmail / Google Workspace', value: 'smtp.gmail.com' },
  { label: 'Outlook / Hotmail / Microsoft 365', value: 'smtp.office365.com' },
  { label: 'Yahoo Mail', value: 'smtp.mail.yahoo.com' },
  { label: 'iCloud / Apple Mail', value: 'smtp.mail.me.com' },
  { label: 'Zoho Mail', value: 'smtp.zoho.com' },
  { label: 'FastMail', value: 'smtp.fastmail.com' },
  { label: 'GMX Mail', value: 'mail.gmx.com' },
  { label: 'Proton Mail (Bridge)', value: '127.0.0.1' },
]

export const SMTP_CUSTOM_NO_MATCH_MESSAGE = `No matching provider found.
This will be treated as a custom SMTP server.

Enter the SMTP hostname provided by your email host.
Examples: mail.example.com, smtp.yourdomain.com
Do not include https://, ports, or paths.`
