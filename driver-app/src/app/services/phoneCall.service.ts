export type PhoneCallOption = {
  id: 'primary' | 'secondary'
  label: 'Primary phone' | 'Secondary phone'
  displayValue: string
  dialValue: string
}

export const phoneCallService = {
  launchPhoneCall(dialValue: string) {
    window.location.href = `tel:${dialValue}`
  },
}
