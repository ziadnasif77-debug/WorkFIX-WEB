import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: number
  className?: string
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name || 'Avatar'}
        width={size}
        height={size}
        className={`avatar ${className}`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }

  return (
    <div
      className={`avatar-placeholder ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--primary)',
        color: '#fff',
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {getInitials(name)}
    </div>
  )
}
