import type { InstructionStep } from '@/shared/layout/CustomInstructions/CustomInstructions.types'

export const getInviteMemberInstructions = (): InstructionStep[] => [
  {
    header: [
      {
        type: 'title',
        children: [{ text: 'Members and ownership' }],
      },
    ],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Invite teammates who need shared visibility into planning, operations, and daily execution work.',
          },
        ],
      },
    ],
  },
  {
    header: [
      {
        type: 'title',
        children: [{ text: 'Role access' }],
      },
    ],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'Role name and role id define what the invited member can access and manage inside your workspace.',
          },
        ],
      },
    ],
  },
  {
    header: [
      {
        type: 'title',
        children: [{ text: 'Connected apps' }],
      },
    ],
    body: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'The right team access helps members move across admin, operational, and delivery apps with less friction.',
          },
        ],
      },
    ],
  },
]
