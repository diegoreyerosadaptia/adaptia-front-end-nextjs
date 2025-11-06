'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'dark' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position="bottom-right"
      richColors
      expand
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'backdrop-blur-md border text-sm font-medium shadow-lg transition-all',
        },
        style: {
          fontFamily: 'Urbanist, sans-serif',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '14px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
          color: '#fff',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      }}
      className={`
        z-[9999] toaster group
        [data-type='success']:bg-[rgba(34,197,94,0.15)] 
        [data-type='success']:border-[rgba(34,197,94,0.6)]
        [data-type='success']:text-[#22c55e]

        [data-type='error']:bg-[rgba(239,68,68,0.15)] 
        [data-type='error']:border-[rgba(239,68,68,0.6)]
        [data-type='error']:text-[#ef4444]

        [data-type='info']:bg-[rgba(59,130,246,0.15)] 
        [data-type='info']:border-[rgba(59,130,246,0.6)]
        [data-type='info']:text-[#3b82f6]

        [data-type='warning']:bg-[rgba(234,179,8,0.15)] 
        [data-type='warning']:border-[rgba(234,179,8,0.6)]
        [data-type='warning']:text-[#facc15]
      `}
      {...props}
    />
  )
}

export { Toaster }
