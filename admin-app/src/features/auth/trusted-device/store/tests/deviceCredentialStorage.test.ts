import { deviceCredentialStorage } from '../deviceCredentialStorage'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

export const runDeviceCredentialStorageTests = () => {
  deviceCredentialStorage.clearCredential()

  // no credential -> no headers
  {
    assert(deviceCredentialStorage.getCredential() === null, 'starts empty')
    assert(
      Object.keys(deviceCredentialStorage.getHeaders()).length === 0,
      'no headers when unenrolled',
    )
  }

  // save -> exact header names
  {
    deviceCredentialStorage.saveCredential({
      client_id: 'tdv_1',
      device_secret: 'secret-1',
    })
    const headers = deviceCredentialStorage.getHeaders()
    assert(headers['X-Trusted-Device-Id'] === 'tdv_1', 'device id header set')
    assert(headers['X-Trusted-Device-Secret'] === 'secret-1', 'device secret header set')
    assert(
      deviceCredentialStorage.getCredential()?.client_id === 'tdv_1',
      'credential retrievable',
    )
  }

  // invalid credential is ignored
  {
    deviceCredentialStorage.saveCredential({ client_id: '', device_secret: '' })
    assert(
      deviceCredentialStorage.getCredential()?.client_id === 'tdv_1',
      'invalid save does not overwrite a valid credential',
    )
  }

  // subscribers notified on change
  {
    const seen: (string | null)[] = []
    const unsubscribe = deviceCredentialStorage.subscribe((credential) => {
      seen.push(credential?.client_id ?? null)
    })
    deviceCredentialStorage.saveCredential({
      client_id: 'tdv_2',
      device_secret: 'secret-2',
    })
    unsubscribe()
    assert(seen[0] === 'tdv_1', 'subscriber gets current on subscribe')
    assert(seen.includes('tdv_2'), 'subscriber notified on change')
  }

  // clear -> forgotten
  {
    deviceCredentialStorage.clearCredential()
    assert(deviceCredentialStorage.getCredential() === null, 'cleared')
    assert(
      Object.keys(deviceCredentialStorage.getHeaders()).length === 0,
      'no headers after clear',
    )
  }
}
