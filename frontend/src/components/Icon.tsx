import type { ReactNode } from 'react'
import type { Domain } from '../types'

export type IconName = 'home' | 'session' | 'progress' | 'sql' | 'python' | 'english' | 'arrow' | 'back' | 'spark' | 'clock' | 'check' | 'lock'

interface Props {
  name: IconName
  className?: string
}

export default function Icon({ name, className = '' }: Props) {
  const paths: Record<IconName, ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9v11h13V9M9.5 20v-6h5v6"/></>,
    session: <><circle cx="12" cy="12" r="8"/><path d="m12 8 4 4-4 4M8 12h8"/></>,
    progress: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    sql: <><ellipse cx="12" cy="5.5" rx="7" ry="3"/><path d="M5 5.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6M5 11.5v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></>,
    python: <><path d="M9 3.5h6a3 3 0 0 1 3 3v3h-5a3 3 0 0 0-3 3v2.5H7a3 3 0 0 1-3-3v-5.5a3 3 0 0 1 3-3Z"/><path d="M15 20.5H9a3 3 0 0 1-3-3v-3h5a3 3 0 0 0 3-3V9h3a3 3 0 0 1 3 3v5.5a3 3 0 0 1-3 3Z"/></>,
    english: <><path d="M4 5h16v12H9l-5 4V5Z"/><path d="M8 9h8M8 13h5"/></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
    back: <><path d="M19 12H5M10 7l-5 5 5 5"/></>,
    spark: <><path d="m12 2 1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>
  }

  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export const domainIcon: Record<Domain, IconName> = {
  sql: 'sql',
  python: 'python',
  english: 'english'
}
