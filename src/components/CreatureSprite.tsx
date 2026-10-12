import type { CSSProperties } from 'react'
import { getColor } from '../data/colors'
import { getForm } from '../data/species'
import type { GrowthStage } from '../types/models'
import './CreatureSprite.css'

interface Props {
  formId: string
  colorId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  silhouette?: boolean
  reacting?: boolean
  className?: string
}

const STAGE_EMOJI: Record<GrowthStage, string> = {
  egg: '🥚',
  juvenile: '🐣',
  growth: '🐉',
  adult: '🐉',
  apex: '✨',
}

export function CreatureSprite({
  formId,
  colorId,
  size = 'md',
  silhouette = false,
  reacting = false,
  className = '',
}: Props) {
  const form = getForm(formId)
  const color = getColor(colorId)
  const stage = form?.stage ?? 'egg'

  return (
    <div
      className={`creature-sprite size-${size} stage-${stage}${silhouette ? ' is-silhouette' : ''}${reacting ? ' is-reacting' : ''} ${className}`}
      style={
        {
          '--c-primary': color.primary,
          '--c-secondary': color.secondary,
          '--c-accent': color.accent,
        } as CSSProperties
      }
      aria-hidden={silhouette}
      role="img"
      aria-label={silhouette ? '未発見' : (form?.name ?? 'キャラクター')}
    >
      <div className="sprite-glow" />
      <div className="sprite-body">
        {stage === 'egg' ? (
          <div className="egg-shape">
            <span className="egg-shine" />
            <span className="egg-speckle s1" />
            <span className="egg-speckle s2" />
          </div>
        ) : (
          <div className="dragon-shape">
            <span className="dragon-horn left" />
            <span className="dragon-horn right" />
            <span className="dragon-face">
              <span className="eye left" />
              <span className="eye right" />
              <span className="blush left" />
              <span className="blush right" />
            </span>
            {(stage === 'growth' || stage === 'adult' || stage === 'apex') && (
              <span className="dragon-wing left" />
            )}
            {(stage === 'growth' || stage === 'adult' || stage === 'apex') && (
              <span className="dragon-wing right" />
            )}
            {(stage === 'adult' || stage === 'apex') && <span className="dragon-tail" />}
            {stage === 'apex' && <span className="dragon-crown" />}
          </div>
        )}
      </div>
      <span className="sprite-fallback">{STAGE_EMOJI[stage]}</span>
    </div>
  )
}
