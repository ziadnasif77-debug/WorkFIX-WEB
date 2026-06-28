interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  rounded?: boolean
}

export default function Skeleton({ width = '100%', height = 16, className = '', rounded = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded ? '50%' : 8,
        background: 'var(--bg-tertiary, #e5e7eb)',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ padding: 16 }}>
      <Skeleton height={20} width="60%" />
      <Skeleton height={14} width="90%" className="mt-2" />
      <Skeleton height={14} width="40%" className="mt-2" />
    </div>
  )
}
