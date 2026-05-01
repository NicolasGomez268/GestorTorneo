interface Props {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className = '' }: Props) {
  return (
    <div className={`max-w-[1200px] mx-auto px-4 lg:px-6 ${className}`}>
      {children}
    </div>
  )
}
