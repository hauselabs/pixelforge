import { create } from 'zustand'
import type { CanvasObject, Tool, Mode } from './types'

const MAX_HISTORY = 50

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

interface CanvasStore {
  objects: CanvasObject[]
  selectedId: string | null
  tool: Tool
  mode: Mode
  history: CanvasObject[][]
  historyIndex: number
  stageScale: number
  stagePos: { x: number; y: number }
  connectionStatus: ConnectionStatus
  // actions
  addObject: (obj: CanvasObject) => void
  updateObject: (id: string, updates: Partial<CanvasObject>) => void
  removeObject: (id: string) => void
  setSelected: (id: string | null) => void
  setTool: (tool: Tool) => void
  setMode: (mode: Mode) => void
  clearCanvas: () => void
  setObjects: (objects: CanvasObject[]) => void
  undo: () => void
  redo: () => void
  setStageScale: (scale: number) => void
  setStagePos: (pos: { x: number; y: number }) => void
  pushHistory: (objects: CanvasObject[]) => void
  setConnectionStatus: (status: ConnectionStatus) => void
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  objects: [],
  selectedId: null,
  tool: 'select',
  mode: 'local',
  history: [[]],
  historyIndex: 0,
  stageScale: 1,
  stagePos: { x: 0, y: 0 },
  connectionStatus: 'disconnected',

  pushHistory: (objects) => {
    const { history, historyIndex } = get()
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...objects])
    // Cap history size
    if (newHistory.length > MAX_HISTORY) newHistory.shift()
    set({
      history: newHistory,
      historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY - 1),
    })
  },

  addObject: (obj) => {
    const { objects, pushHistory } = get()
    const newObjects = [...objects, obj]
    pushHistory(newObjects)
    set({ objects: newObjects })
  },

  updateObject: (id, updates) => set((state) => ({
    objects: state.objects.map((obj) =>
      obj.id === id ? { ...obj, ...updates } : obj
    ),
  })),

  removeObject: (id) => {
    const { objects, pushHistory } = get()
    const newObjects = objects.filter((obj) => obj.id !== id)
    pushHistory(newObjects)
    set({
      objects: newObjects,
      selectedId: get().selectedId === id ? null : get().selectedId,
    })
  },

  setSelected: (id) => set({ selectedId: id }),

  setTool: (tool) => set({ tool }),

  setMode: (mode) => set({ mode }),

  clearCanvas: () => {
    const { pushHistory } = get()
    pushHistory([])
    set({ objects: [], selectedId: null })
  },

  setObjects: (objects) => set({ objects }),

  undo: () => {
    const { historyIndex, history } = get()
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    set({
      objects: [...history[newIndex]],
      historyIndex: newIndex,
      selectedId: null,
    })
  },

  redo: () => {
    const { historyIndex, history } = get()
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    set({
      objects: [...history[newIndex]],
      historyIndex: newIndex,
    })
  },

  setStageScale: (scale) => set({ stageScale: scale }),
  setStagePos: (pos) => set({ stagePos: pos }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
}))
