export type ReactionOrder = 1 | 2
export type AxisMode = 'log' | 'linear'

export type SpectrumPoint = {
  x: number
  y: number
}

export type CurveSeries = {
  name: string
  N: number | 'PFR'
  color: string
  points: SpectrumPoint[]
}

export type AbsoluteSpaceTimes = {
  ratio: number
  tauN: number
  tauP: number
  x: number
  conversion: number
}

export type AxisRange = {
  minX: number
  maxX: number
  minY: number
  maxY: number
  axisMode: AxisMode
}

const SAFE_CURVE_N = [1, 2, 3, 4, 6, 10]
const CURVE_COLORS = ['#1d4ed8', '#0f766e', '#ea580c', '#7c3aed', '#0891b2', '#f59e0b', '#16a34a']

export function normalizeX(x: number): number {
  const value = Number(x)
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    throw new Error('Concentration ratio x must be strictly between 0 and 1 for the reactor model.')
  }
  return value
}

export function validateAxisRange({ minX, maxX, minY, maxY, axisMode }: AxisRange): void {
  if (!Number.isFinite(minX) || !Number.isFinite(maxX) || !Number.isFinite(minY) || !Number.isFinite(maxY)) {
    throw new Error('Axis limits must be finite numeric values.')
  }

  if (axisMode === 'log') {
    if (minX <= 0 || maxX <= 0 || minY <= 0 || maxY <= 0) {
      throw new Error('Logarithmic axes require positive limits greater than zero.')
    }
    if (minX >= maxX || minY >= maxY) {
      throw new Error('Logarithmic axis minimum values must be less than the corresponding maximum values.')
    }
  } else if (minX >= maxX || minY >= maxY) {
    throw new Error('Linear axis minimum values must be less than the corresponding maximum values.')
  }
}

export function calculateFirstOrderRatio(x: number, N: number): number {
  const value = normalizeX(x)
  if (!Number.isInteger(N) || N < 1) {
    throw new Error('The number of reactors must be a positive integer.')
  }

  if (N === Number.POSITIVE_INFINITY || N >= 1e12) {
    return 1
  }

  return (N * (Math.pow(value, -1 / N) - 1)) / (-Math.log(value))
}

export function calculateFirstOrderPfrRatio(x: number): number {
  normalizeX(x)
  return 1
}

export function calculateFirstOrderDimensionlessSpaceTime(x: number, N: number): number {
  const value = normalizeX(x)
  if (N === Number.POSITIVE_INFINITY || N >= 1e12) {
    return -Math.log(value)
  }
  if (!Number.isInteger(N) || N < 1) {
    throw new Error('The number of reactors must be a positive integer.')
  }
  return N * (Math.pow(value, -1 / N) - 1)
}

export function calculateFirstOrderPfrDimensionlessSpaceTime(x: number): number {
  return -Math.log(normalizeX(x))
}

function evaluateSecondOrderFinalConcentration(theta: number, N: number): number {
  let concentration = 1
  for (let stage = 0; stage < N; stage += 1) {
    if (theta <= 0) {
      concentration = 1
      continue
    }
    const discriminant = 1 + 4 * theta * concentration
    const nextValue = (-1 + Math.sqrt(discriminant)) / (2 * theta)
    concentration = Math.min(Math.max(nextValue, 0), 1)
  }
  return concentration
}

export function solveSecondOrderTheta(x: number, N: number): number {
  const value = normalizeX(x)
  if (!Number.isInteger(N) || N < 1) {
    throw new Error('The number of reactors must be a positive integer.')
  }

  let low = 0
  let high = 1
  while (evaluateSecondOrderFinalConcentration(high, N) > value) {
    high *= 2
    if (high > 1e12) {
      throw new Error('Unable to find a stable theta value for the selected conversion.')
    }
  }

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const midpoint = (low + high) / 2
    const finalValue = evaluateSecondOrderFinalConcentration(midpoint, N)
    if (finalValue > value) {
      low = midpoint
    } else {
      high = midpoint
    }
  }

  return (low + high) / 2
}

export function calculateSecondOrderRatio(x: number, N: number): number {
  const value = normalizeX(x)
  if (N === Number.POSITIVE_INFINITY || N >= 1e12) {
    return 1
  }
  if (!Number.isInteger(N) || N < 1) {
    throw new Error('The number of reactors must be a positive integer.')
  }
  const theta = solveSecondOrderTheta(value, N)
  return (N * theta) / (1 / value - 1)
}

export function calculateSecondOrderPfrRatio(x: number): number {
  normalizeX(x)
  return 1
}

export function calculateSecondOrderDimensionlessSpaceTime(x: number, N: number): number {
  const value = normalizeX(x)
  if (N === Number.POSITIVE_INFINITY || N >= 1e12) {
    return 1 / value - 1
  }
  if (!Number.isInteger(N) || N < 1) {
    throw new Error('The number of reactors must be a positive integer.')
  }
  return N * solveSecondOrderTheta(value, N)
}

export function calculateSecondOrderPfrDimensionlessSpaceTime(x: number): number {
  const value = normalizeX(x)
  return 1 / value - 1
}

export function calculateAbsoluteSpaceTimes({
  reactionOrder,
  x,
  N,
  k,
  CA0,
}: {
  reactionOrder: ReactionOrder
  x: number
  N: number
  k: number
  CA0: number
}): AbsoluteSpaceTimes {
  if (!Number.isFinite(k) || k <= 0) {
    throw new Error('The kinetic constant k must be positive.')
  }
  if (!Number.isFinite(CA0) || CA0 <= 0) {
    throw new Error('The initial concentration CA0 must be positive.')
  }

  const value = normalizeX(x)
  const ratio =
    reactionOrder === 1 ? calculateFirstOrderRatio(value, N) : calculateSecondOrderRatio(value, N)

  if (reactionOrder === 1) {
    const tauP = (-Math.log(value)) / k
    return {
      ratio,
      tauN: ratio * tauP,
      tauP,
      x: value,
      conversion: 1 - value,
    }
  }

  const tauP = (1 / (k * CA0)) * (1 / value - 1)
  return {
    ratio,
    tauN: ratio * tauP,
    tauP,
    x: value,
    conversion: 1 - value,
  }
}

function generateCurveSamples(): number[] {
  const points: number[] = []
  for (let index = 0; index <= 240; index += 1) {
    const raw = 0.01 * Math.pow(100, index / 240)
    points.push(Math.min(raw, 0.999999))
  }
  return points
}

function generateCurves(
  calculateForN: (x: number, N: number) => number,
  calculatePfr: (x: number) => number,
): CurveSeries[] {
  const samples = generateCurveSamples()
  const curves: CurveSeries[] = SAFE_CURVE_N.map((N, index) => ({
    name: `N = ${N}`,
    N,
    color: CURVE_COLORS[index % CURVE_COLORS.length],
    points: samples.map((x) => ({ x, y: calculateForN(x, N) })),
  }))

  curves.push({
    name: 'PFR limit',
    N: 'PFR',
    color: '#111827',
    points: samples.map((x) => ({ x, y: calculatePfr(x) })),
  })

  return curves
}

export function generateFirstOrderCurves(): CurveSeries[] {
  return generateCurves(calculateFirstOrderRatio, calculateFirstOrderPfrRatio)
}

export function generateSecondOrderCurves(): CurveSeries[] {
  return generateCurves(calculateSecondOrderRatio, calculateSecondOrderPfrRatio)
}

export function generateFirstOrderDimensionlessCurves(): CurveSeries[] {
  return generateCurves(calculateFirstOrderDimensionlessSpaceTime, calculateFirstOrderPfrDimensionlessSpaceTime)
}

export function generateSecondOrderDimensionlessCurves(): CurveSeries[] {
  return generateCurves(calculateSecondOrderDimensionlessSpaceTime, calculateSecondOrderPfrDimensionlessSpaceTime)
}

export function getCurvePalette(): Record<number | string, string> {
  const palette: Record<number | string, string> = {}
  SAFE_CURVE_N.forEach((N, index) => {
    palette[N] = CURVE_COLORS[index % CURVE_COLORS.length]
  })
  palette.PFR = '#111827'
  return palette
}

export function getSelectedRatio({ reactionOrder, x, N }: { reactionOrder: ReactionOrder; x: number; N: number }): number {
  if (reactionOrder === 1) {
    return calculateFirstOrderRatio(x, N)
  }
  return calculateSecondOrderRatio(x, N)
}

export function getReactionLabel(reactionOrder: ReactionOrder): string {
  return reactionOrder === 1 ? 'First-order reaction' : 'Elementary second-order reaction'
}

export const DEFAULT_AXIS = {
  minX: 0.01,
  maxX: 1,
  minY: 1,
  maxY: 30,
}
