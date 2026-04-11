import type { InstructionStep } from '@/shared/layout/CustomInstructions'
import type { SmtpProviderKey } from './smtpProviderOptions'

type InstructionResolver = () => InstructionStep[]

/**
 * Generic steps for well-known email providers
 */
const buildSteps = (
  providerLabel: string,
  guideUrl: string,
  videoUrl: string = 'https://www.youtube.com/results?search_query=how+to+generate+smtp+app+password',
): InstructionStep[] => [
  {
    header: [{ type: 'title', children: [{ text: 'Step 1: Choose the correct SMTP server' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: `Select "${providerLabel}" as your SMTP server, or type the server address exactly as shown by your email provider.`,
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'The SMTP server tells the system which email service should be used to send emails on your behalf.',
          },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 2: Enter the SMTP username' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'In most cases, the SMTP username is your full email address (for example: name@company.com).',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'This tells the email provider which mailbox is sending the emails.',
          },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 3: Generate and use an SMTP password' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Do NOT use your normal email login password here.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Most email providers require you to generate a special app-specific password for SMTP access.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Open the setup guide', link: guideUrl, underline: true },
          {
            text: ' and follow the steps to generate an SMTP or app password for your email account.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'You can also watch a video guide here', link: videoUrl, underline: true },
          { text: ' if you prefer a visual walkthrough.' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Once generated, copy the password and paste it into the SMTP Password field.',
          },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 4: Connection security (TLS / SSL)' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Most providers use TLS with port 587. Enable TLS unless your provider explicitly says otherwise.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Use SSL with port 465 only if your provider specifically instructs you to do so.',
          },
        ],
      },
    ],
  },
]

/**
 * Fallback for custom domain / unknown providers
 */
const buildCustomDomainFallback = (): InstructionStep[] => [
  {
    header: [{ type: 'title', children: [{ text: 'Step 1: Identify your email provider' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'If you use a custom domain (for example info@yourcompany.com), your email is usually managed by your hosting provider.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Check where your email is hosted (for example cPanel, Plesk, or a hosting dashboard).',
          },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 2: SMTP username and password' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'The SMTP username is usually the full email address of the mailbox.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'The SMTP password is created in your hosting or email management panel. It may be different from your normal login password.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'If possible, create a dedicated mailbox or app password specifically for system notifications.',
          },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 3: Verify server settings' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Confirm the SMTP server address, port number, and whether TLS or SSL is required.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'If emails fail to send, your provider may require additional setup such as SPF, DKIM, or DMARC.',
          },
        ],
      },
    ],
  },
]

/**
 * Proton Mail Bridge instructions
 */
const buildProtonBridgeSteps = (): InstructionStep[] => [
  {
    header: [{ type: 'title', children: [{ text: 'Proton Mail requires Proton Bridge' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Proton Mail does not allow direct SMTP access. You must install Proton Mail Bridge on your computer.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'The Bridge creates local SMTP credentials that this system can use.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Open Proton Bridge setup guide', link: 'https://proton.me/support/proton-mail-bridge', underline: true },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Use Bridge-generated settings' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Set SMTP server to 127.0.0.1 and use the port, username, and password shown in Proton Bridge.',
          },
        ],
      },
    ],
  },
]

const EXACT_SERVER_MAP: Record<SmtpProviderKey, InstructionResolver> = {
  'smtp.gmail.com': () =>
    buildSteps('Gmail / Google Workspace', 'https://support.google.com/accounts/answer/185833'),
  'smtp.office365.com': () =>
    buildSteps(
      'Outlook / Hotmail / Microsoft 365',
      'https://support.microsoft.com/account-billing/how-to-get-and-use-app-passwords-5896ed9b-4263-e681-128a-a6f2979a7944',
    ),
  'smtp.mail.yahoo.com': () =>
    buildSteps('Yahoo Mail', 'https://help.yahoo.com/kb/SLN15241.html'),
  'smtp.mail.me.com': () =>
    buildSteps('iCloud / Apple Mail', 'https://support.apple.com/en-us/102654'),
  'smtp.zoho.com': () =>
    buildSteps('Zoho Mail', 'https://www.zoho.com/mail/help/adminconsole/two-factor-authentication.html'),
  'smtp.fastmail.com': () =>
    buildSteps('FastMail', 'https://www.fastmail.help/hc/en-us/articles/360058753834'),
  'mail.gmx.com': () =>
    buildSteps('GMX Mail', 'https://support.gmx.com/pop-imap/imap/index.html'),
  '127.0.0.1': buildProtonBridgeSteps,
}

const AMAZON_SES_PATTERN = /^email-smtp\.[a-z0-9-]+\.amazonaws\.com$/i

const normalizeSmtpServer = (value: string): string => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''
  const withoutProtocol = trimmed.replace(/^https?:\/\//, '')
  const hostWithOptionalPort = withoutProtocol.split('/')[0] ?? ''
  return hostWithOptionalPort.split(':')[0]?.trim() ?? ''
}

const isKnownSmtpProviderKey = (value: string): value is SmtpProviderKey =>
  Object.prototype.hasOwnProperty.call(EXACT_SERVER_MAP, value)

export const getSmtpPasswordInstructions = (smtpServerValue: string): InstructionStep[] => {
  const normalized = normalizeSmtpServer(smtpServerValue)

  if (normalized && AMAZON_SES_PATTERN.test(normalized)) {
    return buildSteps('Amazon SES', 'https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html')
  }

  if (isKnownSmtpProviderKey(normalized)) {
    return EXACT_SERVER_MAP[normalized]()
  }

  return buildCustomDomainFallback()
}