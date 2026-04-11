export const MESSAGE_TEMPLATE_PERMISSION_INFO = {
  title: 'Ask for permission',
  content:
    'Turn this on when the message should only be sent after the client explicitly agrees. If it stays off, the system can send the configured SMS or email automatically when the selected event happens.',
}

export const MESSAGE_TEMPLATE_ENABLED_INFO = {
  title: 'Enabled template',
  content:
    'When enabled, this template becomes active for the current event. For example, if the event is order created, the configured message will be sent automatically whenever an order is created. If disabled, the event still happens, but this message is not triggered.',
}
