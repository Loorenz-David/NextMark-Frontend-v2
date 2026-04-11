import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { DocumentIcon } from '@/assets/icons'

import { templateChannels } from '../domain/templateChannel.map'
import type { availableChannels } from '../types'
import { ChannelTabs } from '../components/ChannelTabs'

export const PrintTemplateMainPage = () => {

  const navigate = useNavigate()
  const params = useParams()
  const activeChannel = params.channel as availableChannels | undefined
  const isConfigView = Boolean(params.event)

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section
        className={`admin-glass-panel-strong relative overflow-hidden rounded-[28px] ${
          isConfigView ? 'px-6 py-5' : 'px-8 py-7'
        }`}
      >
        <div
          className={`pointer-events-none absolute left-0 top-0 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl ${
            isConfigView ? 'h-28 w-44' : 'h-40 w-56'
          }`}
        />
        <div className="relative flex items-center gap-5">
          <div
            className={`flex items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))] ${
              isConfigView ? 'h-16 w-16' : 'h-20 w-20'
            }`}
          >
            <DocumentIcon className={isConfigView ? 'h-7 w-7' : 'h-9 w-9'} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Print Templates
            </p>
            <h1
              className={`font-semibold leading-none text-[var(--color-text)] ${
                isConfigView ? 'text-[1.55rem]' : 'text-[2rem]'
              }`}
            >
              {isConfigView ? 'Template editor' : 'Template configuration'}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              {isConfigView
                ? 'Adjust variant, orientation, and publishing options for the selected template.'
                : 'Configure automatic PDF downloads by channel and event, and preview layout variants before saving them.'}
            </p>
          </div>
        </div>
      </section>

      <section className="admin-glass-panel-strong flex flex-col gap-6 rounded-[28px] p-5 shadow-none">
        <ChannelTabs
          channels={templateChannels}
          activeChannel={activeChannel}
          onSelectChannel={(channel) => navigate(`/settings/print-templates/${channel}`)}
        />

        <div className="min-h-0 flex-1 overflow-auto scroll-thin">
        <Outlet />
        </div>
      </section>
      </div>
  )
}
