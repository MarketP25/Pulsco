'use client'

import { SubsystemInfo } from '../../types/subsystem'

interface SubsystemCardProps {
  subsystem: SubsystemInfo
  onLaunch: () => void
}

export function SubsystemCard({ subsystem, onLaunch }: SubsystemCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getHealthColor = (health: number) => {
    if (health >= 95) return 'text-green-400'
    if (health >= 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700 p-6 hover:border-slate-600 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{subsystem.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
              {subsystem.name}
            </h3>
            <p className="text-sm text-slate-400">{subsystem.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(subsystem.status)}`}></div>
          <span className="text-xs text-slate-400 capitalize">{subsystem.status}</span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Health</span>
          <span className={`text-sm font-medium ${getHealthColor(subsystem.health)}`}>
            {subsystem.health}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${subsystem.health}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {subsystem.regionCount} regions • {subsystem.userCount.toLocaleString()} users
        </div>
        <button
          onClick={onLaunch}
          disabled={subsystem.status === 'offline'}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
        >
          Launch
        </button>
      </div>

      {/* Features Preview */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex flex-wrap gap-1">
          {subsystem.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded-md"
            >
              {feature}
            </span>
          ))}
          {subsystem.features.length > 3 && (
            <span className="px-2 py-1 bg-slate-700 text-xs text-slate-500 rounded-md">
              +{subsystem.features.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
