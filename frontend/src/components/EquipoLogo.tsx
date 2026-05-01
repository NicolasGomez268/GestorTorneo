interface Props {
  nombre: string
  color: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

function getInitials(nombre: string) {
  return nombre.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

const sizes = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export default function EquipoLogo({ nombre, color, size = 'md' }: Props) {
  return (
    <div
      className={`${sizes[size]} flex items-center justify-center font-black text-white shrink-0 select-none`}
      style={{ backgroundColor: color }}
    >
      {getInitials(nombre)}
    </div>
  )
}
