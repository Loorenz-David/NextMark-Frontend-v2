import type { LoginPayload } from '@/app/services/auth.api'

type SubmitDriverLoginDependencies = {
  login: (payload: LoginPayload) => Promise<boolean>
}

export async function submitDriverLoginAction(
  dependencies: SubmitDriverLoginDependencies,
  payload: LoginPayload,
) {
  return dependencies.login(payload)
}
