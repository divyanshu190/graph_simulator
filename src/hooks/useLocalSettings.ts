import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'
export type ReactionOrder = 1 | 2

export type AppSettings = {
  theme: ThemeMode
  reactionOrder: ReactionOrder
  conversion: number
  N: number
  k: number
  CA0: number
  axisMode: 'log' | 'linear'
  minX: number
  maxX: number
  minY: number
  maxY: number
  showGrid: boolean
  showReference: boolean
  showMarker: boolean
}

export const defaultSettings: AppSettings = {
  theme: 'light',
  reactionOrder: 1,
  conversion: 50,
  N: 2,
  k: 0.5,
  CA0: 1,
  axisMode: 'log',
  minX: 0.01,
  maxX: 1,
  minY: 1,
  maxY: 30,
  showGrid: true,
  showReference: true,
  showMarker: true,
}

export function useLocalSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const raw = localStorage.getItem('cre-graph-lab-settings')
    if (!raw) {
      return defaultSettings
    }

    try {
      return { ...defaultSettings, ...JSON.parse(raw) }
    } catch {
      return defaultSettings
    }
  })

  useEffect(() => {
    localStorage.setItem('cre-graph-lab-settings', JSON.stringify(settings))
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
    document.documentElement.style.colorScheme = settings.theme
  }, [settings])

  const resetSettings = () => setSettings(defaultSettings)

  return { settings, setSettings, resetSettings }
}
