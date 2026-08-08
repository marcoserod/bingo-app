import { useMemo } from 'react'
import { NumberCell } from './NumberCell'

interface NumberGridProps {
  calledNumbers: number[]
  onRemoveIntent?: (number: number) => void
}

export function NumberGrid({ calledNumbers, onRemoveIntent }: NumberGridProps) {
  const calledSet = useMemo(() => new Set(calledNumbers), [calledNumbers])
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1)

  return (
    <div 
      className="grid gap-2 w-full min-w-max"
      style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
    >
      {numbers.map((num) => (
        <NumberCell 
          key={num} 
          number={num} 
          isCalled={calledSet.has(num)}
          onClick={() => onRemoveIntent?.(num)}
        />
      ))}
    </div>
  )
}
