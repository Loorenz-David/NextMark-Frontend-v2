import { useMemo, useState } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { MessageIcon } from '@/assets/icons'

import { EmailMessageMainPage } from '../emailMessage/pages/EmailMessageMainPage'
import { SmsMessageMainPage } from '../smsMessage/pages/SmsMessageMainPage'
import { MessagesLayout } from '../layout/MessagesLayout'

type MessageTabKey = 'sms' | 'email'

const TABS: { key: MessageTabKey; label: string }[] = [
  { key: 'sms', label: 'SMS' },
  { key: 'email', label: 'Email' },
]

const MessagesMainContent = () => {
  const [activeTab, setActiveTab] = useState<MessageTabKey>('sms')

  const content = useMemo(() => {
    switch (activeTab) {
      case 'email':
        return <EmailMessageMainPage />
      case 'sms':
      default:
        return <SmsMessageMainPage />
    }
  }, [activeTab])

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative shrink-0 overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <MessageIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Message Automations
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              SMS and email templates
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Build reusable communication templates for order events and keep SMS and email automation easy to manage.
            </p>
          </div>
        </div>
      </section>

      <MessagesLayout tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
        {content}
      </MessagesLayout>
    </div>
  )
}

export const MessagesMainPage = (_: StackComponentProps<undefined>) => <MessagesMainContent />
