'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, ExternalLink } from 'lucide-react'

interface SurfCommand {
  name: string
  description: string
}

const COMMANDS: SurfCommand[] = [
  { name: 'canvas.addShape', description: 'Add any shape (rect, circle, text, line, frame)' },
  { name: 'canvas.getState', description: 'Get canvas state' },
  { name: 'canvas.export', description: 'Export canvas as JSON snapshot' },
  { name: 'canvas.clear', description: 'Clear canvas' },
  { name: 'canvas.updateObject', description: 'Update object properties' },
  { name: 'canvas.removeObject', description: 'Remove object by ID' },
  { name: 'canvas.setGradient', description: 'Apply gradient fill' },
]

export function SurfBadgeWrapper() {
  const [open, setOpen] = useState(false)
  const endpoint =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://pixelforge-pearl.vercel.app'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-14 right-0 w-[300px] rounded-xl overflow-hidden"
            style={{
              background: 'rgba(15,15,18,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #00C9B1)' }}>
                  <Zap size={10} className="text-white" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-white">Surf Enabled</div>
                  <div className="text-[10px] text-white/40">PixelForge v2</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            {/* Commands */}
            <div className="px-4 py-3">
              <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-white/25 mb-2">Commands</div>
              <div className="space-y-1.5">
                {COMMANDS.map((cmd) => (
                  <div key={cmd.name} className="flex items-start gap-2">
                    <code className="text-[10px] font-mono text-[#60A5FA] flex-shrink-0 bg-white/5 px-1.5 py-0.5 rounded">
                      {cmd.name}
                    </code>
                    <span className="text-[10px] text-white/35 leading-relaxed pt-0.5">{cmd.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Endpoint */}
            <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="text-[9px] text-white/20 font-mono flex items-center gap-1">
                <ExternalLink size={8} />
                {endpoint}/api/surf
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge button */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg focus:outline-none"
        style={{
          background: 'linear-gradient(135deg, #2563EB, #00C9B1)',
          boxShadow: '0 4px 16px rgba(37,99,235,0.35), 0 2px 4px rgba(0,0,0,0.2)',
        }}
        title="Surf protocol"
      >
        <Zap size={16} className="text-white" />
      </motion.button>
    </div>
  )
}
