import { useMemo, useState } from 'react'
import { Beaker, FlaskConical } from 'lucide-react'
import { BlockMath, InlineMath } from 'react-katex'
import Plot from 'react-plotly.js'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
import 'katex/dist/katex.min.css'
import {
  DEFAULT_AXIS,
  calculateAbsoluteSpaceTimes,
  calculateFirstOrderDimensionlessSpaceTime,
  calculateFirstOrderRatio,
  calculateSecondOrderDimensionlessSpaceTime,
  calculateSecondOrderRatio,
  generateFirstOrderDimensionlessCurves,
  generateFirstOrderCurves,
  generateSecondOrderDimensionlessCurves,
  generateSecondOrderCurves,
  getSelectedRatio,
} from './calculations/reactorModels'
import { MetricCard } from './components/MetricCard'
import { SliderControl } from './components/SliderControl'
import { ThemeToggle } from './components/ThemeToggle'
import { useLocalSettings, type AppSettings } from './hooks/useLocalSettings'
import { exportCsv } from './utils/exportCsv'

function App() {
  const { settings, setSettings, resetSettings } = useLocalSettings()

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <FlaskConical size={20} />
            </div>
            <div className="text-lg font-bold tracking-tight">CRE Graph Lab</div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              Home
            </NavLink>
            <NavLink to="/first-order" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              First-Order Reaction
            </NavLink>
            <NavLink to="/second-order" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              Second-Order Reaction
            </NavLink>
            <NavLink to="/compare" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              Compare Reactions
            </NavLink>
            <NavLink to="/theory" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              Theory
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}>
              About
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle
              theme={settings.theme}
              onToggle={() => setSettings((prev) => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
            />
            <button
              type="button"
              onClick={() => resetSettings()}
              className="hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 md:inline-flex"
            >
              Reset All
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/first-order" element={<SingleReactionPage reactionOrder={1} settings={settings} setSettings={setSettings} />} />
          <Route path="/second-order" element={<SingleReactionPage reactionOrder={2} settings={settings} setSettings={setSettings} />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/theory" element={<TheoryPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  )
}

function HomePage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-sky-100 via-white to-cyan-100 p-8 shadow-sm ring-1 ring-sky-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:ring-slate-800">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">Reactor design learning</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
          Understand Reactor Performance. One Variable at a Time.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Explore how conversion, reaction kinetics, and the number of mixed-flow reactors affect reactor volume requirements compared with plug flow.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link to="/first-order" className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-200"><Beaker size={18} /></div>
              <div>
                <h2 className="text-2xl font-semibold">First-Order Reaction</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">A → Products</p>
              </div>
            </div>
            <div className="mt-4 h-24 rounded-xl bg-gradient-to-r from-sky-100 via-cyan-50 to-white p-3 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
              <div className="flex h-full items-end gap-1">
                <div className="w-1/12 rounded-t bg-sky-500" style={{ height: '32%' }} />
                <div className="w-1/12 rounded-t bg-sky-500" style={{ height: '44%' }} />
                <div className="w-1/12 rounded-t bg-sky-500" style={{ height: '58%' }} />
                <div className="w-1/12 rounded-t bg-sky-500" style={{ height: '74%' }} />
                <div className="w-1/12 rounded-t bg-sky-500" style={{ height: '86%' }} />
                <div className="w-1/12 rounded-t bg-sky-500" style={{ height: '100%' }} />
              </div>
            </div>
            <div className="mt-5 inline-flex rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white">Explore</div>
          </Link>

          <Link to="/second-order" className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-2 text-orange-700 dark:bg-orange-950 dark:text-orange-200"><FlaskConical size={18} /></div>
              <div>
                <h2 className="text-2xl font-semibold">Elementary Second-Order</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">2A → Products</p>
              </div>
            </div>
            <div className="mt-4 h-24 rounded-xl bg-gradient-to-r from-orange-100 via-amber-50 to-white p-3 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
              <div className="flex h-full items-end gap-1">
                <div className="w-1/12 rounded-t bg-orange-500" style={{ height: '18%' }} />
                <div className="w-1/12 rounded-t bg-orange-500" style={{ height: '30%' }} />
                <div className="w-1/12 rounded-t bg-orange-500" style={{ height: '44%' }} />
                <div className="w-1/12 rounded-t bg-orange-500" style={{ height: '58%' }} />
                <div className="w-1/12 rounded-t bg-orange-500" style={{ height: '72%' }} />
                <div className="w-1/12 rounded-t bg-orange-500" style={{ height: '90%' }} />
              </div>
            </div>
            <div className="mt-5 inline-flex rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white">Explore</div>
          </Link>
        </div>
      </div>
    </section>
  )
}

function SingleReactionPage({
  reactionOrder,
  settings,
  setSettings,
}: {
  reactionOrder: 1 | 2
  settings: AppSettings
  setSettings: ReturnType<typeof useLocalSettings>['setSettings']
}) {
  const [graphMetric, setGraphMetric] = useState<'ratio' | 'dimensionless'>('ratio')
  const conversion = settings.conversion / 100
  const x = 1 - conversion
  const ratio = getSelectedRatio({ reactionOrder, x, N: settings.N })
  const currentResults = calculateAbsoluteSpaceTimes({
    reactionOrder,
    x,
    N: settings.N,
    k: settings.k,
    CA0: settings.CA0,
  })

  const showDimensionlessTime = graphMetric === 'dimensionless'
  const curves = reactionOrder === 1
    ? showDimensionlessTime ? generateFirstOrderDimensionlessCurves() : generateFirstOrderCurves()
    : showDimensionlessTime ? generateSecondOrderDimensionlessCurves() : generateSecondOrderCurves()
  const graphY = showDimensionlessTime
    ? reactionOrder === 1
      ? calculateFirstOrderDimensionlessSpaceTime(x, settings.N)
      : calculateSecondOrderDimensionlessSpaceTime(x, settings.N)
    : ratio
  const yAxisTitle = showDimensionlessTime
    ? reactionOrder === 1 ? 'k τ_N' : 'k C_A0 τ_N'
    : 'τ_N / τ_P'

  const plotData = useMemo(() => {
    const allSeries = curves.map((curve) => ({
      x: curve.points.map((point) => point.x),
      y: curve.points.map((point) => point.y),
      type: 'scatter',
      mode: 'lines',
      name: curve.name,
      line: { color: curve.color, width: curve.N === settings.N ? 4 : 2 },
      hovertemplate: `x=%{x}<br>Conversion XA=%{customdata[0]}<br>N=%{customdata[1]}<br>${yAxisTitle}=%{y}<extra></extra>`,
      customdata: curve.points.map((point) => [1 - point.x, curve.N === 'PFR' ? '∞' : curve.N]),
    }))

    return [
      ...allSeries,
      {
        x: [x],
        y: [graphY],
        mode: 'markers',
        type: 'scatter',
        name: 'Selected point',
        marker: { color: '#0f172a', size: 10 },
        hovertemplate: `x=%{x}<br>XA=%{customdata}<br>${yAxisTitle}=%{y}<extra></extra>`,
        customdata: [settings.conversion],
      },
    ]
  }, [curves, graphY, settings.N, settings.conversion, x, yAxisTitle])

  const yValues = showDimensionlessTime ? curves.flatMap((curve) => curve.points.map((point) => point.y)) : []
  const dimensionlessYRange = yValues.length
    ? [Math.min(...yValues) * 0.9, Math.max(...yValues) * 1.1]
    : undefined

  const handleResetAxes = () => {
    setSettings((prev) => ({ ...prev, minX: DEFAULT_AXIS.minX, maxX: DEFAULT_AXIS.maxX, minY: DEFAULT_AXIS.minY, maxY: DEFAULT_AXIS.maxY }))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Selected conversion" value={`${settings.conversion.toFixed(0)}%`} detail="XA" />
        <MetricCard label="Unconverted fraction" value={x.toFixed(3)} detail="CA/CA0" />
        <MetricCard label="Reactor performance ratio" value={`${ratio.toFixed(2)}×`} detail="τN/τP" />
        <MetricCard label="Space-time comparison" value={`${currentResults.tauN.toFixed(2)} / ${currentResults.tauP.toFixed(2)}`} detail="τN and τP" />
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto">
          <h3 className="mb-4 text-lg font-semibold">Controls</h3>
          <div className="space-y-3">
            <SliderControl label="Conversion, XA" value={settings.conversion} min={0} max={99} onChange={(value) => setSettings((prev) => ({ ...prev, conversion: value }))} unit="%" />
            <SliderControl label="Number of equal-sized CSTRs, N" value={settings.N} min={1} max={10} onChange={(value) => setSettings((prev) => ({ ...prev, N: value }))} />
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Reaction order</span>
              <select
                value={reactionOrder}
                onChange={(event) => setSettings((prev) => ({ ...prev, reactionOrder: Number(event.target.value) as 1 | 2 }))}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value={1}>First order, n = 1</option>
                <option value={2}>Elementary second order, n = 2</option>
              </select>
            </label>
            <SliderControl label="Kinetic constant, k" value={settings.k} min={0.05} max={5} step={0.05} onChange={(value) => setSettings((prev) => ({ ...prev, k: value }))} description="Affects dimensional space times only." />
            <SliderControl label="Initial concentration, CA0" value={settings.CA0} min={0.1} max={10} step={0.1} onChange={(value) => setSettings((prev) => ({ ...prev, CA0: value }))} description="Applies to absolute τ values." />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Graph Settings</h4>
                <button type="button" onClick={handleResetAxes} className="text-xs font-medium text-sky-600">Reset Axes</button>
              </div>
              <div className="mb-3 grid grid-cols-2 rounded-lg bg-slate-200 p-1 text-xs dark:bg-slate-700" aria-label="Graph quantity">
                <button type="button" onClick={() => setGraphMetric('ratio')} aria-pressed={!showDimensionlessTime} className={`rounded-md px-2 py-1.5 font-medium ${!showDimensionlessTime ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>Space-time ratio</button>
                <button type="button" onClick={() => setGraphMetric('dimensionless')} aria-pressed={showDimensionlessTime} className={`rounded-md px-2 py-1.5 font-medium ${showDimensionlessTime ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>Dimensionless time</button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input value={settings.minX} onChange={(event) => setSettings((prev) => ({ ...prev, minX: Number(event.target.value) }))} className="rounded border bg-white px-2 py-1 text-sm dark:bg-slate-900" aria-label="Horizontal minimum" />
                <input value={settings.maxX} onChange={(event) => setSettings((prev) => ({ ...prev, maxX: Number(event.target.value) }))} className="rounded border bg-white px-2 py-1 text-sm dark:bg-slate-900" aria-label="Horizontal maximum" />
                {showDimensionlessTime ? (
                  <p className="col-span-2 text-xs text-slate-500 dark:text-slate-400">Vertical bounds fit the dimensionless-time curves automatically.</p>
                ) : (
                  <>
                    <input value={settings.minY} onChange={(event) => setSettings((prev) => ({ ...prev, minY: Number(event.target.value) }))} className="rounded border bg-white px-2 py-1 text-sm dark:bg-slate-900" aria-label="Vertical minimum" />
                    <input value={settings.maxY} onChange={(event) => setSettings((prev) => ({ ...prev, maxY: Number(event.target.value) }))} className="rounded border bg-white px-2 py-1 text-sm dark:bg-slate-900" aria-label="Vertical maximum" />
                  </>
                )}
              </div>
              <div className="mt-3 flex gap-3 text-xs">
                <button type="button" onClick={() => setSettings((prev) => ({ ...prev, axisMode: 'log' }))} className={`rounded-full px-2 py-1 ${settings.axisMode === 'log' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Log</button>
                <button type="button" onClick={() => setSettings((prev) => ({ ...prev, axisMode: 'linear' }))} className={`rounded-full px-2 py-1 ${settings.axisMode === 'linear' ? 'bg-sky-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Linear</button>
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Plot
            data={plotData}
            layout={{
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              margin: { l: 60, r: 20, b: 60, t: 20 },
              xaxis: {
                type: settings.axisMode,
                title: { text: '1 - X_A = C_A / C_A0' },
                range: settings.axisMode === 'log' ? [Math.log10(settings.minX), Math.log10(settings.maxX)] : [settings.minX, settings.maxX],
                gridcolor: 'rgba(148,163,184,0.35)',
                zeroline: false,
              },
              yaxis: {
                type: settings.axisMode,
                title: { text: yAxisTitle },
                range: showDimensionlessTime
                  ? settings.axisMode === 'log' && dimensionlessYRange
                    ? [Math.log10(dimensionlessYRange[0]), Math.log10(dimensionlessYRange[1])]
                    : dimensionlessYRange
                  : settings.axisMode === 'log' ? [Math.log10(settings.minY), Math.log10(settings.maxY)] : [settings.minY, settings.maxY],
                gridcolor: 'rgba(148,163,184,0.35)',
                zeroline: false,
              },
              legend: { orientation: 'h', y: 1.15 },
              hovermode: 'closest',
            }}
            useResizeHandler
            style={{ width: '100%', height: 'clamp(420px, calc(100vh - 14rem), 600px)' }}
            config={{ responsive: true, displaylogo: false, scrollZoom: true }}
          />
        </section>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-semibold">What does this graph tell us?</h3>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          At {settings.conversion.toFixed(0)}% conversion, {settings.N === 1 ? 'a single CSTR' : `N = ${settings.N} equal-sized CSTRs`} require approximately {ratio.toFixed(2)} times the space time of a PFR for the selected reaction.
        </p>
        <div className="mt-4 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900 dark:bg-sky-950 dark:text-sky-200">
          <strong>Why?</strong> A single CSTR mixes the reactant and product streams, so the reactor spends a larger fraction of its residence time at lower conversion than a PFR. Adding more equal-sized CSTRs in series improves the approximation to plug flow by reducing the concentration gradients and the residence-time mismatch.
        </div>
      </div>
    </div>
  )
}

function ComparePage() {
  const [conversion, setConversion] = useState(50)
  const x = 1 - conversion / 100
  const firstRatio = calculateFirstOrderRatio(x, 2)
  const secondRatio = calculateSecondOrderRatio(x, 2)
  const firstTau = calculateAbsoluteSpaceTimes({ reactionOrder: 1, x, N: 2, k: 0.5, CA0: 1 }).tauP
  const secondTau = calculateAbsoluteSpaceTimes({ reactionOrder: 2, x, N: 2, k: 0.5, CA0: 1 }).tauP

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold">Compare Reactions</h2>
          <button type="button" onClick={() => exportCsv('comparison.csv', [{ conversion, firstRatio, secondRatio, firstTau, secondTau }])} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white">Export CSV</button>
        </div>
        <SliderControl label="Conversion, XA" value={conversion} min={0} max={99} onChange={setConversion} unit="%" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <Plot data={generateFirstOrderCurves().map((curve) => ({ x: curve.points.map((point) => point.x), y: curve.points.map((point) => point.y), type: 'scatter', mode: 'lines', name: curve.name, line: { color: curve.color, width: curve.N === 2 ? 4 : 2 } }))} layout={{ margin: { l: 40, r: 20, b: 40, t: 10 }, xaxis: { type: 'log', title: '1 - X_A = C_A / C_A0' }, yaxis: { type: 'log', title: 'τ_N / τ_P' } }} style={{ width: '100%', height: '420px' }} config={{ displaylogo: false }} />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <Plot data={generateSecondOrderCurves().map((curve) => ({ x: curve.points.map((point) => point.x), y: curve.points.map((point) => point.y), type: 'scatter', mode: 'lines', name: curve.name, line: { color: curve.color, width: curve.N === 2 ? 4 : 2 } }))} layout={{ margin: { l: 40, r: 20, b: 40, t: 10 }, xaxis: { type: 'log', title: '1 - X_A = C_A / C_A0' }, yaxis: { type: 'log', title: 'τ_N / τ_P' } }} style={{ width: '100%', height: '420px' }} config={{ displaylogo: false }} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2">Conversion</th>
              <th className="px-3 py-2">Number of CSTRs</th>
              <th className="px-3 py-2">First-order τN/τP</th>
              <th className="px-3 py-2">Second-order τN/τP</th>
              <th className="px-3 py-2">First-order τP</th>
              <th className="px-3 py-2">Second-order τP</th>
              <th className="px-3 py-2">Interpretation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2">{conversion}%</td>
              <td className="px-3 py-2">2</td>
              <td className="px-3 py-2">{firstRatio.toFixed(2)}</td>
              <td className="px-3 py-2">{secondRatio.toFixed(2)}</td>
              <td className="px-3 py-2">{firstTau.toFixed(2)}</td>
              <td className="px-3 py-2">{secondTau.toFixed(2)}</td>
              <td className="px-3 py-2">The first-order case is more forgiving at the same conversion.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TheoryPage() {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">Theory and learning</h1>
      <p className="text-slate-600 dark:text-slate-300">The plotted ratio is a relative space-time requirement, not a reaction rate.</p>
      <div className="space-y-3 text-slate-700 dark:text-slate-200">
        <p><strong>1. What is a CSTR?</strong> A continuous stirred-tank reactor is a well-mixed vessel where the composition is uniform throughout the reactor volume.</p>
        <p><strong>2. What is a PFR?</strong> A plug-flow reactor has no radial mixing and fluid elements move through the vessel with position-dependent conversion.</p>
        <p><strong>3. What does equal-sized CSTRs in series mean?</strong> The total reactor volume is split into several identical tanks connected in series, each with the same residence time.</p>
        <p><strong>4. What is space time, τ = V/v0?</strong> Space time is the reactor volume divided by the volumetric feed rate, telling how long the feed spends in the system.</p>
        <p><strong>5. What is conversion, XA?</strong> The conversion is the fraction of feed reacted, so <InlineMath math="X_A = 1 - C_A/C_{A0}" /> under constant density.</p>
        <p><strong>6. Why is C_A/C_A0 = 1 - X_A?</strong> With constant density, concentration is proportional to conversion and the stoichiometric ratio stays fixed.</p>
        <p><strong>7. Why are the axes logarithmic?</strong> Reactor ratios and concentration fractions often span orders of magnitude, so a log scale reveals the shapes near low conversion and helps compare a wide range.</p>
        <p><strong>8. Why does increasing N move the train toward PFR behavior?</strong> As each tank gets smaller and the number of stages increases, the axial concentration profile approaches the ideal plug-flow profile.</p>
        <p><strong>9. How do first-order and second-order rate laws differ?</strong> First-order kinetics scale with concentration, while second-order kinetics scale with the square of concentration.</p>
        <p><strong>10. What assumptions are used?</strong> Constant density, ideal mixing for CSTRs, steady state, perfect equal-size stages, and matching overall conversion.</p>
      </div>
      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
        <BlockMath math="R = \frac{\tau_N}{\tau_P} = \frac{N(x^{-1/N}-1)}{-\ln x}" />
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">For first-order kinetics, this is the analytical ratio used in the simulator.</p>
      </div>
      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
        <BlockMath math="R = \frac{N\theta}{1/x - 1}" />
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">For elementary second-order kinetics, theta is computed numerically with the equal-space-time condition.</p>
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-3xl font-bold">About this lab</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">This educational tool is designed to show how reactor size and mixing affect process performance for first-order and elementary second-order reactions. It focuses on the idealized comparison between a train of equal-sized CSTRs and an ideal plug-flow reactor.</p>
      <p className="mt-3 text-slate-600 dark:text-slate-300">The calculations remain grounded in the assumptions of constant density, steady-state operation, and matched overall conversion. The ratio shown on the graph is the required relative space time, not the reaction rate or conversion efficiency.</p>
    </div>
  )
}

export default App
