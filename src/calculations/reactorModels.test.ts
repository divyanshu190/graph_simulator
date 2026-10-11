import { describe, expect, it } from 'vitest'
import {
  calculateFirstOrderRatio,
  calculateFirstOrderPfrRatio,
  calculateSecondOrderRatio,
  calculateSecondOrderPfrRatio,
  calculateFirstOrderDimensionlessSpaceTime,
  calculateFirstOrderPfrDimensionlessSpaceTime,
  calculateSecondOrderDimensionlessSpaceTime,
  calculateSecondOrderPfrDimensionlessSpaceTime,
  calculateAbsoluteSpaceTimes,
  generateFirstOrderCurves,
  generateSecondOrderCurves,
  validateAxisRange,
} from './reactorModels'

describe('reactor models', () => {
  it('enforces first-order N=1 analytical behavior', () => {
    expect(calculateFirstOrderRatio(0.5, 1)).toBeCloseTo((1 / 0.5 - 1) / (-Math.log(0.5)), 10)
  })

  it('keeps first-order PFR limit at 1', () => {
    expect(calculateFirstOrderPfrRatio(0.5)).toBe(1)
    expect(calculateFirstOrderPfrRatio(0.1)).toBe(1)
  })

  it('enforces second-order N=1 analytical behavior', () => {
    expect(calculateSecondOrderRatio(0.5, 1)).toBeCloseTo(2, 10)
  })

  it('calculates the dimensionless space times for both reaction orders', () => {
    expect(calculateFirstOrderDimensionlessSpaceTime(0.5, 1)).toBeCloseTo(1, 10)
    expect(calculateFirstOrderPfrDimensionlessSpaceTime(0.5)).toBeCloseTo(Math.log(2), 10)
    expect(calculateSecondOrderDimensionlessSpaceTime(0.5, 1)).toBeCloseTo(2, 10)
    expect(calculateSecondOrderPfrDimensionlessSpaceTime(0.5)).toBeCloseTo(1, 10)
  })

  it('keeps second-order PFR limit at 1', () => {
    expect(calculateSecondOrderPfrRatio(0.5)).toBe(1)
    expect(calculateSecondOrderPfrRatio(0.1)).toBe(1)
  })

  it('approaches 1 as x approaches 1 for both orders', () => {
    expect(calculateFirstOrderRatio(0.999, 10)).toBeGreaterThan(0.999)
    expect(calculateSecondOrderRatio(0.999, 10)).toBeGreaterThan(0.999)
    expect(calculateFirstOrderRatio(0.9999, 2)).toBeGreaterThan(0.999)
    expect(calculateSecondOrderRatio(0.9999, 2)).toBeGreaterThan(0.999)
  })

  it('increasing N approaches the PFR result at fixed conversion', () => {
    const x = 0.2
    const r1 = calculateFirstOrderRatio(x, 1)
    const r10 = calculateFirstOrderRatio(x, 10)
    const r2 = calculateSecondOrderRatio(x, 2)
    const r10s = calculateSecondOrderRatio(x, 10)
    expect(r10).toBeLessThan(r1)
    expect(r10s).toBeLessThan(r2)
    expect(r10).toBeLessThan(1.2)
    expect(r10s).toBeLessThan(1.2)
  })

  it('generates positive space times and k influences only dimensional time', () => {
    const first = calculateAbsoluteSpaceTimes({ reactionOrder: 1, x: 0.5, N: 2, k: 0.5, CA0: 2 })
    const second = calculateAbsoluteSpaceTimes({ reactionOrder: 1, x: 0.5, N: 2, k: 1.5, CA0: 2 })
    expect(first.tauP).toBeGreaterThan(0)
    expect(first.tauN).toBeGreaterThan(0)
    expect(first.ratio).toBeCloseTo(second.ratio, 10)
    expect(second.tauP).toBeLessThan(first.tauP)
    expect(second.tauN).toBeLessThan(first.tauN)

    const secondOrder1 = calculateAbsoluteSpaceTimes({ reactionOrder: 2, x: 0.5, N: 2, k: 0.5, CA0: 2 })
    const secondOrder2 = calculateAbsoluteSpaceTimes({ reactionOrder: 2, x: 0.5, N: 2, k: 1.5, CA0: 2 })
    expect(secondOrder1.ratio).toBeCloseTo(secondOrder2.ratio, 10)
    expect(secondOrder2.tauP).toBeLessThan(secondOrder1.tauP)
  })

  it('rejects invalid axis ranges safely', () => {
    expect(() => validateAxisRange({ minX: 0, maxX: 1, minY: 0.1, maxY: 10, axisMode: 'log' })).toThrow()
    expect(() => validateAxisRange({ minX: 0.001, maxX: 0.0005, minY: 0.1, maxY: 10, axisMode: 'log' })).toThrow()
    expect(() => validateAxisRange({ minX: 0.001, maxX: 1, minY: 0.1, maxY: 10, axisMode: 'log' })).not.toThrow()
  })

  it('builds curve tables for both reaction orders', () => {
    expect(generateFirstOrderCurves().length).toBeGreaterThan(5)
    expect(generateSecondOrderCurves().length).toBeGreaterThan(5)
  })
})
