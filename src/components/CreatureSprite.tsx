import { useId, type CSSProperties } from 'react'
import { getColor } from '../data/colors'
import { getForm } from '../data/species'
import type { Element, GrowthStage } from '../types/models'
import './CreatureSprite.css'

interface Props {
  formId: string
  colorId: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  silhouette?: boolean
  reacting?: boolean
  className?: string
}

type VisualKit =
  | 'egg-light'
  | 'egg-water'
  | 'juvenile'
  | 'growth-wing'
  | 'growth-fin'
  | 'growth-ember'
  | 'adult-light'
  | 'adult-star'
  | 'adult-guard'
  | 'adult-tide'
  | 'adult-mist'
  | 'adult-steam'
  | 'apex-holy'
  | 'apex-galaxy'
  | 'apex-temple'
  | 'apex-ocean'
  | 'apex-geyser'

function resolveKit(formId: string, stage: GrowthStage, element: Element): VisualKit {
  if (stage === 'egg') return element === 'water' ? 'egg-water' : 'egg-light'
  if (stage === 'juvenile') return 'juvenile'

  if (stage === 'growth') {
    if (formId.includes('flame') || formId.includes('steam')) return 'growth-ember'
    if (element === 'water' || formId.includes('stream') || formId.includes('tide')) {
      return 'growth-fin'
    }
    return 'growth-wing'
  }

  if (stage === 'adult') {
    if (formId.includes('guardian')) return 'adult-guard'
    if (formId.includes('star')) return 'adult-star'
    if (formId.includes('mist')) return 'adult-mist'
    if (formId.includes('steam')) return 'adult-steam'
    if (formId.includes('tide') || element === 'water') return 'adult-tide'
    return 'adult-light'
  }

  // apex
  if (formId.includes('galaxy')) return 'apex-galaxy'
  if (formId.includes('temple')) return 'apex-temple'
  if (formId.includes('ocean')) return 'apex-ocean'
  if (formId.includes('geyser')) return 'apex-geyser'
  return 'apex-holy'
}

function SvgEgg({ water, uid }: { water?: boolean; uid: string }) {
  const g = `${uid}-egg`
  return (
    <svg viewBox="0 0 120 140" className="sprite-svg" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" />
          <stop offset="55%" stopColor="var(--c-primary)" />
          <stop offset="100%" stopColor="var(--c-secondary)" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="78" rx="40" ry="48" fill={`url(#${g})`} />
      <ellipse cx="46" cy="58" rx="12" ry="9" fill="#fff" opacity="0.55" />
      {water ? (
        <>
          <path
            d="M30 80 Q60 70 90 80"
            fill="none"
            stroke="var(--c-secondary)"
            strokeWidth="3"
            opacity="0.55"
          />
          <path
            d="M34 95 Q60 85 86 95"
            fill="none"
            stroke="var(--c-secondary)"
            strokeWidth="2.5"
            opacity="0.4"
          />
        </>
      ) : (
        <>
          <path d="M42 70 L50 95 L58 70" fill="none" stroke="#fff6c8" strokeWidth="2.5" opacity="0.7" />
          <path d="M62 75 L70 100 L78 78" fill="none" stroke="#fff6c8" strokeWidth="2" opacity="0.5" />
          <circle cx="72" cy="62" r="3" fill="#fff6c8" opacity="0.8" />
        </>
      )}
      <ellipse className="egg-inner-glow" cx="60" cy="82" rx="16" ry="14" fill="var(--c-accent)" opacity="0.35" />
    </svg>
  )
}

function SvgJuvenile({ uid }: { uid: string }) {
  const g = `${uid}-j`
  return (
    <svg viewBox="0 0 140 140" className="sprite-svg" aria-hidden="true">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" />
          <stop offset="100%" stopColor="var(--c-primary)" />
        </linearGradient>
      </defs>
      {/* tiny stubby body */}
      <ellipse cx="70" cy="88" rx="34" ry="30" fill={`url(#${g})`} />
      <ellipse cx="70" cy="96" rx="18" ry="14" fill="#fff" opacity="0.55" />
      {/* head */}
      <circle cx="70" cy="52" r="28" fill="var(--c-primary)" />
      <circle cx="70" cy="52" r="28" fill="var(--c-accent)" opacity="0.35" />
      {/* tiny horn buds */}
      <ellipse cx="54" cy="28" rx="5" ry="8" fill="var(--c-secondary)" transform="rotate(-18 54 28)" />
      <ellipse cx="86" cy="28" rx="5" ry="8" fill="var(--c-secondary)" transform="rotate(18 86 28)" />
      {/* face */}
      <circle cx="60" cy="52" r="4.5" fill="#243041" />
      <circle cx="80" cy="52" r="4.5" fill="#243041" />
      <circle cx="61.5" cy="50.5" r="1.5" fill="#fff" />
      <circle cx="81.5" cy="50.5" r="1.5" fill="#fff" />
      <ellipse cx="52" cy="60" rx="5" ry="3" fill="#ff8fa3" opacity="0.55" />
      <ellipse cx="88" cy="60" rx="5" ry="3" fill="#ff8fa3" opacity="0.55" />
      {/* stubby limbs */}
      <ellipse cx="42" cy="95" rx="8" ry="10" fill="var(--c-primary)" />
      <ellipse cx="98" cy="95" rx="8" ry="10" fill="var(--c-primary)" />
      <ellipse cx="56" cy="116" rx="8" ry="7" fill="var(--c-secondary)" />
      <ellipse cx="84" cy="116" rx="8" ry="7" fill="var(--c-secondary)" />
    </svg>
  )
}

function SvgGrowth({
  variant,
  uid,
}: {
  variant: 'wing' | 'fin' | 'ember'
  uid: string
}) {
  const body = `${uid}-gb`
  const wing = `${uid}-gw`
  return (
    <svg viewBox="0 0 160 160" className="sprite-svg" aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" />
          <stop offset="55%" stopColor="var(--c-primary)" />
          <stop offset="100%" stopColor="var(--c-secondary)" />
        </linearGradient>
        <linearGradient id={wing} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" />
          <stop offset="100%" stopColor="var(--c-secondary)" />
        </linearGradient>
      </defs>
      {/* appendages behind */}
      {variant === 'fin' ? (
        <>
          <path className="anim-sway" d="M18 70 Q8 95 28 120 L48 90 Z" fill={`url(#${wing})`} opacity="0.9" />
          <path className="anim-sway-r" d="M142 70 Q152 95 132 120 L112 90 Z" fill={`url(#${wing})`} opacity="0.9" />
        </>
      ) : (
        <>
          <path
            className="anim-flap"
            d="M20 55 Q0 40 8 90 Q18 115 48 95 Q35 75 20 55"
            fill={`url(#${wing})`}
          />
          <path
            className="anim-flap-r"
            d="M140 55 Q160 40 152 90 Q142 115 112 95 Q125 75 140 55"
            fill={`url(#${wing})`}
          />
        </>
      )}
      {variant === 'ember' && (
        <>
          <path className="anim-rise" d="M40 30 L45 10 L50 30" fill="#ffb070" opacity="0.8" />
          <path className="anim-rise" d="M75 22 L80 2 L85 22" fill="#ffe0c0" opacity="0.85" />
          <path className="anim-rise" d="M110 30 L115 10 L120 30" fill="#ffb070" opacity="0.8" />
        </>
      )}
      {/* body longer */}
      <ellipse cx="80" cy="95" rx="36" ry="40" fill={`url(#${body})`} />
      <ellipse cx="80" cy="105" rx="18" ry="16" fill="#fff" opacity="0.45" />
      {/* head */}
      <ellipse cx="80" cy="48" rx="30" ry="28" fill="var(--c-primary)" />
      {/* growing horns */}
      <path d="M58 30 L52 8 L66 28 Z" fill="var(--c-secondary)" />
      <path d="M102 30 L108 8 L94 28 Z" fill="var(--c-secondary)" />
      {/* eyes sharper */}
      <ellipse cx="68" cy="48" rx="5" ry="6" fill="#243041" />
      <ellipse cx="92" cy="48" rx="5" ry="6" fill="#243041" />
      <circle cx="69.5" cy="46" r="1.6" fill="#fff" />
      <circle cx="93.5" cy="46" r="1.6" fill="#fff" />
      {/* small snout */}
      <ellipse cx="80" cy="62" rx="10" ry="7" fill="var(--c-secondary)" opacity="0.55" />
      {/* limbs */}
      <ellipse cx="50" cy="110" rx="10" ry="14" fill="var(--c-primary)" />
      <ellipse cx="110" cy="110" rx="10" ry="14" fill="var(--c-primary)" />
      <ellipse cx="62" cy="138" rx="10" ry="9" fill="var(--c-secondary)" />
      <ellipse cx="98" cy="138" rx="10" ry="9" fill="var(--c-secondary)" />
      {/* tail */}
      <path d="M112 115 Q145 120 150 95 Q130 110 112 115" fill="var(--c-secondary)" />
      <circle className="anim-twinkle" cx="30" cy="40" r="3" fill="var(--c-accent)" />
      <circle className="anim-twinkle" cx="128" cy="36" r="2.5" fill="#fff" />
    </svg>
  )
}

function SvgAdult({
  variant,
  uid,
}: {
  variant: 'light' | 'star' | 'guard' | 'tide' | 'mist' | 'steam'
  uid: string
}) {
  const isAquatic = variant === 'tide'
  const isGuard = variant === 'guard'
  const isStar = variant === 'star'
  const isMist = variant === 'mist'
  const isSteam = variant === 'steam'
  const body = `${uid}-ab`
  const wing = `${uid}-aw`
  const glow = `${uid}-ag`

  return (
    <svg viewBox="0 0 200 200" className="sprite-svg" aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" />
          <stop offset="45%" stopColor="var(--c-primary)" />
          <stop offset="100%" stopColor="var(--c-secondary)" />
        </linearGradient>
        <linearGradient id={wing} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-accent)" />
          <stop offset="60%" stopColor="var(--c-secondary)" />
          <stop offset="100%" stopColor="#2a3344" stopOpacity="0.55" />
        </linearGradient>
        <filter id={glow}>
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* large wings / fins */}
      {isAquatic ? (
        <>
          <path
            className="anim-sway"
            d="M10 90 Q-5 120 30 160 L70 110 Z"
            fill={`url(#${wing})`}
            opacity={isMist ? 0.55 : 0.95}
          />
          <path
            className="anim-sway-r"
            d="M190 90 Q205 120 170 160 L130 110 Z"
            fill={`url(#${wing})`}
            opacity={isMist ? 0.55 : 0.95}
          />
        </>
      ) : (
        <>
          <path
            className="anim-flap"
            d="M15 70 Q-20 30 5 120 Q25 165 75 125 Q45 95 15 70"
            fill={`url(#${wing})`}
            opacity={isMist ? 0.5 : 1}
            filter={`url(#${glow})`}
          />
          <path
            className="anim-flap-r"
            d="M185 70 Q220 30 195 120 Q175 165 125 125 Q155 95 185 70"
            fill={`url(#${wing})`}
            opacity={isMist ? 0.5 : 1}
            filter={`url(#${glow})`}
          />
          {/* wing membrane lines */}
          <path d="M20 85 L55 115" stroke="#fff" strokeWidth="1.2" opacity="0.25" />
          <path d="M180 85 L145 115" stroke="#fff" strokeWidth="1.2" opacity="0.25" />
        </>
      )}

      {isSteam && (
        <>
          <path className="anim-rise" d="M55 28 L62 0 L70 28" fill="#ffb070" />
          <path className="anim-rise" d="M95 18 L102 -8 L110 18" fill="#ffe0c0" />
          <path className="anim-rise" d="M130 28 L137 0 L145 28" fill="#ffb070" />
        </>
      )}

      {/* powerful torso */}
      <ellipse
        cx="100"
        cy="120"
        rx={isGuard ? 48 : 42}
        ry={isGuard ? 52 : 48}
        fill={`url(#${body})`}
      />
      {isGuard && (
        <>
          <rect x="72" y="100" width="56" height="10" rx="4" fill="var(--c-secondary)" opacity="0.45" />
          <rect x="74" y="118" width="52" height="9" rx="4" fill="var(--c-secondary)" opacity="0.35" />
          <rect x="76" y="135" width="48" height="8" rx="4" fill="var(--c-secondary)" opacity="0.3" />
        </>
      )}
      <ellipse cx="100" cy="132" rx="20" ry="18" fill="#fff" opacity="0.4" />

      {/* head with snout */}
      <ellipse cx="100" cy="58" rx="34" ry="30" fill="var(--c-primary)" />
      <ellipse cx="100" cy="78" rx="16" ry="12" fill="var(--c-secondary)" opacity="0.7" />
      {/* brow */}
      <path d="M78 50 Q100 42 122 50" fill="none" stroke="var(--c-secondary)" strokeWidth="4" opacity="0.55" />

      {/* big horns */}
      {isStar ? (
        <>
          <path d="M70 40 L55 5 L85 38 Z" fill="var(--c-secondary)" />
          <path d="M130 40 L145 5 L115 38 Z" fill="var(--c-secondary)" />
          <path d="M92 28 L100 0 L108 28 Z" fill="#c8d4ff" />
          <circle className="anim-twinkle" cx="40" cy="40" r="3" fill="#fff" />
          <circle className="anim-twinkle" cx="160" cy="48" r="2.5" fill="#9ad0ff" />
        </>
      ) : (
        <>
          <path d="M68 38 L48 -2 L88 36 Z" fill="var(--c-secondary)" />
          <path d="M132 38 L152 -2 L112 36 Z" fill="var(--c-secondary)" />
          <path d="M52 8 L48 -6 L60 10" fill="#fff6c8" opacity="0.7" />
          <path d="M148 8 L152 -6 L140 10" fill="#fff6c8" opacity="0.7" />
        </>
      )}

      {/* fierce eyes */}
      <ellipse cx="86" cy="56" rx="6" ry="5" fill="#1a2030" />
      <ellipse cx="114" cy="56" rx="6" ry="5" fill="#1a2030" />
      <circle cx="88" cy="54" r="1.8" fill="#fff" />
      <circle cx="116" cy="54" r="1.8" fill="#fff" />
      <circle cx="90" cy="57" r="1.2" fill="var(--c-accent)" />
      <circle cx="118" cy="57" r="1.2" fill="var(--c-accent)" />

      {/* mane */}
      <path
        d="M70 40 Q100 20 130 40 Q120 55 100 50 Q80 55 70 40"
        fill="var(--c-secondary)"
        opacity="0.55"
      />

      {/* arms + claws */}
      <ellipse cx="55" cy="125" rx="14" ry="20" fill="var(--c-primary)" transform="rotate(-15 55 125)" />
      <ellipse cx="145" cy="125" rx="14" ry="20" fill="var(--c-primary)" transform="rotate(15 145 125)" />
      <path d="M42 140 L35 150 L48 148" fill="#f0ebe0" />
      <path d="M48 142 L45 154 L55 148" fill="#f0ebe0" />
      <path d="M158 140 L165 150 L152 148" fill="#f0ebe0" />
      <path d="M152 142 L155 154 L145 148" fill="#f0ebe0" />

      {/* legs */}
      <ellipse cx="78" cy="170" rx="14" ry="16" fill="var(--c-secondary)" />
      <ellipse cx="122" cy="170" rx="14" ry="16" fill="var(--c-secondary)" />

      {/* sweeping tail with blade tip */}
      <path d="M138 145 Q185 150 190 110 Q170 140 138 145" fill="var(--c-secondary)" />
      <path d="M188 112 L200 95 L195 125 Z" fill="var(--c-primary)" />

      {/* light rays */}
      {(variant === 'light' || isStar) && (
        <>
          <path className="anim-twinkle" d="M40 20 L45 45 L50 20" fill="var(--c-accent)" opacity="0.55" />
          <path className="anim-twinkle" d="M150 18 L155 42 L160 18" fill="var(--c-accent)" opacity="0.55" />
        </>
      )}
    </svg>
  )
}

function SvgApex({
  variant,
  uid,
}: {
  variant: 'holy' | 'galaxy' | 'temple' | 'ocean' | 'geyser'
  uid: string
}) {
  const body = `${uid}-xb`
  const wing = `${uid}-xw`
  const aura = `${uid}-xa`
  const glow = `${uid}-xg`
  return (
    <svg viewBox="0 0 220 220" className="sprite-svg" aria-hidden="true">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8e8" />
          <stop offset="35%" stopColor="var(--c-primary)" />
          <stop offset="100%" stopColor="var(--c-secondary)" />
        </linearGradient>
        <linearGradient id={wing} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="40%" stopColor="var(--c-accent)" />
          <stop offset="100%" stopColor="var(--c-secondary)" />
        </linearGradient>
        <radialGradient id={aura} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--c-secondary)" stopOpacity="0" />
        </radialGradient>
        <filter id={glow}>
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="110" cy="115" r="95" fill={`url(#${aura})`} />
      <circle
        className="anim-spin"
        cx="110"
        cy="115"
        r="88"
        fill="none"
        stroke="var(--c-secondary)"
        strokeWidth="2"
        strokeDasharray="6 10"
        opacity="0.55"
      />

      {(variant === 'holy' || variant === 'galaxy') && (
        <ellipse
          className="anim-halo"
          cx="110"
          cy="38"
          rx="48"
          ry="14"
          fill="none"
          stroke={variant === 'galaxy' ? '#9ad0ff' : '#ffe9a0'}
          strokeWidth="4"
          filter={`url(#${glow})`}
        />
      )}

      {/* massive wings */}
      {variant === 'ocean' ? (
        <>
          <path className="anim-sway" d="M5 100 Q-15 140 35 185 L80 120 Z" fill={`url(#${wing})`} />
          <path className="anim-sway-r" d="M215 100 Q235 140 185 185 L140 120 Z" fill={`url(#${wing})`} />
        </>
      ) : (
        <>
          <path
            className="anim-flap"
            d="M8 75 Q-35 20 0 130 Q30 190 85 140 Q40 100 8 75"
            fill={`url(#${wing})`}
            filter={`url(#${glow})`}
          />
          <path
            className="anim-flap-r"
            d="M212 75 Q255 20 220 130 Q190 190 135 140 Q180 100 212 75"
            fill={`url(#${wing})`}
            filter={`url(#${glow})`}
          />
          <path d="M15 95 L70 130" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
          <path d="M205 95 L150 130" stroke="#fff" strokeWidth="1.5" opacity="0.3" />
        </>
      )}

      {variant === 'geyser' && (
        <>
          <path className="anim-rise" d="M70 40 L80 0 L90 40" fill="#ffb070" />
          <path className="anim-rise" d="M105 28 L115 -15 L125 28" fill="#fff" />
          <path className="anim-rise" d="M140 40 L150 0 L160 40" fill="#ffb070" />
        </>
      )}

      {/* towering body */}
      <ellipse cx="110" cy="130" rx="50" ry="58" fill={`url(#${body})`} filter={`url(#${glow})`} />
      <ellipse cx="110" cy="145" rx="22" ry="20" fill="#fff" opacity="0.45" />

      {variant === 'temple' && (
        <>
          <rect x="78" y="108" width="64" height="11" rx="3" fill="#c4a574" opacity="0.7" />
          <rect x="80" y="128" width="60" height="10" rx="3" fill="#c4a574" opacity="0.55" />
          <rect x="84" y="146" width="52" height="9" rx="3" fill="#c4a574" opacity="0.45" />
        </>
      )}

      {/* head */}
      <ellipse cx="110" cy="62" rx="38" ry="34" fill="var(--c-primary)" />
      <ellipse cx="110" cy="84" rx="18" ry="14" fill="var(--c-secondary)" opacity="0.75" />

      {/* triple horns / crown */}
      <path d="M78 42 L55 -8 L98 40 Z" fill="var(--c-secondary)" />
      <path d="M142 42 L165 -8 L122 40 Z" fill="var(--c-secondary)" />
      <path d="M102 30 L110 -12 L118 30 Z" fill="#fff6c8" />
      {variant === 'temple' ? (
        <path
          d="M78 28 H90 V12 H100 V28 H120 V12 H130 V28 H142 V40 H78 Z"
          fill="#e8d5a8"
        />
      ) : (
        <path
          d="M82 24 L92 8 L102 22 L110 4 L118 22 L128 8 L138 24 L110 30 Z"
          fill={`url(#${wing})`}
        />
      )}

      {/* glowing eyes */}
      <ellipse cx="94" cy="60" rx="7" ry="6" fill="#1a2030" />
      <ellipse cx="126" cy="60" rx="7" ry="6" fill="#1a2030" />
      <circle cx="96" cy="58" r="2" fill="#fff" />
      <circle cx="128" cy="58" r="2" fill="#fff" />
      <circle cx="98" cy="62" r="1.6" fill={variant === 'galaxy' ? '#9ad0ff' : '#ffe08a'} />
      <circle cx="130" cy="62" r="1.6" fill={variant === 'galaxy' ? '#9ad0ff' : '#ffe08a'} />

      {/* arms claws legs */}
      <ellipse cx="58" cy="138" rx="16" ry="24" fill="var(--c-primary)" transform="rotate(-18 58 138)" />
      <ellipse cx="162" cy="138" rx="16" ry="24" fill="var(--c-primary)" transform="rotate(18 162 138)" />
      <path d="M42 155 L32 170 L50 165" fill="#f5f0e4" />
      <path d="M48 158 L42 174 L58 166" fill="#f5f0e4" />
      <path d="M178 155 L188 170 L170 165" fill="#f5f0e4" />
      <path d="M172 158 L178 174 L162 166" fill="#f5f0e4" />
      <ellipse cx="85" cy="190" rx="16" ry="16" fill="var(--c-secondary)" />
      <ellipse cx="135" cy="190" rx="16" ry="16" fill="var(--c-secondary)" />

      {/* grand tail */}
      <path d="M155 160 Q210 165 215 110 Q190 155 155 160" fill="var(--c-secondary)" />
      <path d="M212 112 L225 88 L220 130 Z" fill="var(--c-primary)" />
      <path d="M218 100 L232 85 L224 115 Z" fill="#fff6c8" opacity="0.8" />

      <circle className="anim-twinkle" cx="28" cy="50" r="4" fill="#fff" />
      <circle className="anim-twinkle" cx="190" cy="60" r="3" fill="var(--c-accent)" />
      <circle className="anim-twinkle" cx="40" cy="170" r="2.5" fill="#fff" />
      {variant === 'galaxy' && (
        <>
          <circle className="anim-orbit" cx="30" cy="90" r="4" fill="#9ad0ff" />
          <circle className="anim-orbit" cx="195" cy="130" r="3" fill="#c8d4ff" />
        </>
      )}
    </svg>
  )
}

function SpriteArt({ kit, uid }: { kit: VisualKit; uid: string }) {
  switch (kit) {
    case 'egg-light':
      return <SvgEgg uid={uid} />
    case 'egg-water':
      return <SvgEgg water uid={uid} />
    case 'juvenile':
      return <SvgJuvenile uid={uid} />
    case 'growth-wing':
      return <SvgGrowth variant="wing" uid={uid} />
    case 'growth-fin':
      return <SvgGrowth variant="fin" uid={uid} />
    case 'growth-ember':
      return <SvgGrowth variant="ember" uid={uid} />
    case 'adult-light':
      return <SvgAdult variant="light" uid={uid} />
    case 'adult-star':
      return <SvgAdult variant="star" uid={uid} />
    case 'adult-guard':
      return <SvgAdult variant="guard" uid={uid} />
    case 'adult-tide':
      return <SvgAdult variant="tide" uid={uid} />
    case 'adult-mist':
      return <SvgAdult variant="mist" uid={uid} />
    case 'adult-steam':
      return <SvgAdult variant="steam" uid={uid} />
    case 'apex-holy':
      return <SvgApex variant="holy" uid={uid} />
    case 'apex-galaxy':
      return <SvgApex variant="galaxy" uid={uid} />
    case 'apex-temple':
      return <SvgApex variant="temple" uid={uid} />
    case 'apex-ocean':
      return <SvgApex variant="ocean" uid={uid} />
    case 'apex-geyser':
      return <SvgApex variant="geyser" uid={uid} />
  }
}

export function CreatureSprite({
  formId,
  colorId,
  size = 'md',
  silhouette = false,
  reacting = false,
  className = '',
}: Props) {
  const reactId = useId().replace(/:/g, '')
  const form = getForm(formId)
  const color = getColor(colorId)
  const stage: GrowthStage = form?.stage ?? 'egg'
  const element: Element = form?.element ?? 'light'
  const kit = resolveKit(formId, stage, element)

  return (
    <div
      className={[
        'creature-sprite',
        `size-${size}`,
        `stage-${stage}`,
        `kit-${kit}`,
        silhouette ? 'is-silhouette' : '',
        reacting ? 'is-reacting' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
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
      <div className="sprite-aura" />
      <div className="sprite-body">
        <SpriteArt kit={kit} uid={reactId} />
      </div>
    </div>
  )
}
