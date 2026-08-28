import { getApps, initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'

function requiredEnvironmentValue(name: string, value: string | undefined): string {
  const normalized = value?.trim()
  if (!normalized) {
    throw new Error(`Relay mode requires ${name}.`)
  }
  return normalized
}

export async function getWorkbenchIDToken(): Promise<string> {
  const appName = 'somnora-workbench'
  const existing = getApps().find((candidate) => candidate.name === appName)
  const app = existing ?? initializeApp(
    {
      apiKey: requiredEnvironmentValue(
        'VITE_FIREBASE_API_KEY',
        import.meta.env.VITE_FIREBASE_API_KEY,
      ),
      authDomain: requiredEnvironmentValue(
        'VITE_FIREBASE_AUTH_DOMAIN',
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      ),
      projectId: requiredEnvironmentValue(
        'VITE_FIREBASE_PROJECT_ID',
        import.meta.env.VITE_FIREBASE_PROJECT_ID,
      ),
      appId: requiredEnvironmentValue(
        'VITE_FIREBASE_APP_ID',
        import.meta.env.VITE_FIREBASE_APP_ID,
      ),
    },
    appName,
  )
  const auth = getAuth(app)
  const user = auth.currentUser ?? (await signInAnonymously(auth)).user
  return user.getIdToken()
}
