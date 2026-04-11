import type { InstructionStep } from '@/shared/layout/CustomInstructions'

export const getTwilioSetupInstructions = (): InstructionStep[] => [
  {
    header: [{ type: 'title', children: [{ text: 'Step 1: Create or log in to Twilio' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'You need a Twilio account before you can send SMS messages from this app.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'If you are new to Twilio, you can start with a free trial and upgrade later.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Create or access your Twilio account', link: 'https://www.twilio.com/try-twilio', underline: true },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 2: Find your Account SID' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Your Account SID is the main identifier for your Twilio account.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'You can find it in the Twilio Console dashboard and copy it into the form.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Open Twilio Console', link: 'https://console.twilio.com/', underline: true },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 3: Create an API Key and Secret' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Use API Keys for secure access instead of using your Auth Token directly.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Create a new API Key, then copy both the API Key SID and API Key Secret.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Important: the API Key Secret is shown only once, so save it immediately.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Note: For new Twilio accounts, API keys may take some time (minutes to an hour) before they become fully active.',
            underline: true,
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Manage API Keys in Twilio Console', link: 'https://console.twilio.com/us1/account/keys-credentials/api-keys', underline: true },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 4: Get a Twilio phone number' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'SMS messages must be sent from a Twilio phone number that belongs to your account.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'Choose a number with SMS capability and keep it ready for this form.',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Find or buy a Twilio phone number', link: 'https://console.twilio.com/us1/develop/phone-numbers/manage/incoming', underline: true },
        ],
      },
    ],
  },
  {
    header: [{ type: 'title', children: [{ text: 'Step 5: Paste values into this form' }] }],
    body: [
      {
        type: 'paragraph',
        children: [
          { text: 'Account SID maps to "Twilio Account SID".' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'SID maps to "Twilio API Key SID".' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Secret maps to "Twilio Secret Key".' },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Phone Number maps to "Twilio Phone Number".' },
        ],
      },
    ],
  },
]

