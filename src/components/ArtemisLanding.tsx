import { useState } from 'react';
import { ArrowRight, CloudSun, Flame, HeartHandshake, MapPinned, Newspaper, Satellite, Sparkles } from 'lucide-react';
import artemisLogo from '@/logo/Artemis.jpg';

interface ArtemisLandingProps {
  onEnterConsole: () => void;
  onOpenAbout: () => void;
}

const solutionCards = [
  {
    icon: Satellite,
    title: 'Signals arrive fragmented',
    description: 'Artemis combines MODIS and VIIRS observations into one clearer view of active fire activity.',
  },
  {
    icon: CloudSun,
    title: 'Hotspots lack context',
    description: 'Select a hotspot to connect satellite detections with local weather and fire-spread conditions.',
  },
  {
    icon: Newspaper,
    title: 'Response information is scattered',
    description: 'Follow relevant wildfire reporting and understand what is happening around the monitored area.',
  },
  {
    icon: HeartHandshake,
    title: 'Relief access is difficult to find',
    description: 'Reach verified direct relief campaigns and nonprofit support matched to the selected disaster area.',
  },
];

export function ArtemisLanding({ onEnterConsole, onOpenAbout }: ArtemisLandingProps) {
  const [activeSolution, setActiveSolution] = useState(0);
  const selectedSolution = solutionCards[activeSolution];

  return (
    <div className="min-h-screen overflow-hidden bg-[#07090b] text-white/90">
      <header className="border-b border-white/[0.1] bg-[#080b0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8">
          <button onClick={onOpenAbout} className="group flex items-center gap-3 text-left">
            <img
              src={artemisLogo}
              alt="Artemis"
              className="h-10 w-20 rounded-md border border-accent-400/30 object-cover object-[center_48%]"
            />
            <div>
              <div className="font-mono text-sm font-bold tracking-[0.12em] text-white">ARTEMIS</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/40">Fire intelligence platform</div>
            </div>
          </button>
          <button
            onClick={onOpenAbout}
            className="rounded-md border border-white/[0.14] px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60 transition-colors hover:border-accent-400/40 hover:text-accent-200"
          >
            About Artemis
          </button>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-center lg:gap-20 lg:pb-24 lg:pt-24">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="relative">
            <div className="mb-5 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent-300">
              <span className="h-2 w-2 rounded-full bg-accent-400 shadow-[0_0_14px_rgba(249,136,15,0.8)]" />
              From detection to informed action
            </div>
            <h1 className="max-w-3xl font-mono text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-6xl">
              Wildfire signals are everywhere.
              <span className="block text-accent-300">Clarity is not.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
              Fire teams, researchers, and communities need more than isolated hotspot points.
              Artemis turns satellite observations into a shared operational picture with local
              weather, relevant reporting, and pathways to relief.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onEnterConsole}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-500 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.1em] text-black shadow-[0_0_24px_rgba(249,136,15,0.2)] transition-colors hover:bg-accent-400"
              >
                Enter operational console
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={onOpenAbout}
                className="inline-flex items-center justify-center rounded-md border border-white/[0.16] px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-white/65 transition-colors hover:border-white/30 hover:text-white"
              >
                How Artemis works
              </button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">
              <span>NASA FIRMS observations</span>
              <span>OpenWeatherMap context</span>
              <span>Relief access</span>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/[0.12] bg-[#0b0f12]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex items-start justify-between border-b border-white/[0.1] pb-5">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-300">The operational gap</div>
                <h2 className="mt-2 text-xl font-semibold text-white">From a point on a map to a decision</h2>
              </div>
              <Flame className="h-6 w-6 text-accent-300" />
            </div>
            <div className="space-y-5 pt-5">
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-300/20 bg-red-300/10 font-mono text-xs text-red-200">01</div>
                <div>
                  <div className="font-semibold text-white/85">Detect</div>
                  <p className="mt-1 text-sm leading-6 text-white/50">Satellite feeds identify heat signatures, but raw observations can be difficult to compare.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent-300/20 bg-accent-300/10 font-mono text-xs text-accent-200">02</div>
                <div>
                  <div className="font-semibold text-white/85">Understand</div>
                  <p className="mt-1 text-sm leading-6 text-white/50">Weather, location, confidence, and FRP help teams prioritize what deserves attention.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-300/10 font-mono text-xs text-emerald-200">03</div>
                <div>
                  <div className="font-semibold text-white/85">Coordinate action</div>
                  <p className="mt-1 text-sm leading-6 text-white/50">Connect monitoring with news and direct relief access for the people affected.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 border-t border-white/[0.1] pt-5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-emerald-200/70">Live workflow ready</span>
              <span className="ml-auto font-mono text-[10px] text-white/30">03 connected steps</span>
            </div>
          </div>
        </section>

        <section className="border-y border-white/[0.08] bg-white/[0.018]">
          <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:py-16">
            <div className="mb-7 flex items-end justify-between gap-5">
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-300">What Artemis solves</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">A connected picture for wildfire response</h2>
              </div>
              <MapPinned className="hidden h-7 w-7 text-white/25 sm:block" />
            </div>
            <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.1] sm:grid-cols-2">
                {solutionCards.map(({ icon: Icon, title }, index) => (
                  <button
                    key={title}
                    onClick={() => setActiveSolution(index)}
                    className={`group min-h-32 bg-[#0b0f12] p-5 text-left transition-colors hover:bg-[#11171b] ${activeSolution === index ? 'bg-accent-400/[0.08] ring-1 ring-inset ring-accent-400/35' : ''}`}
                    aria-pressed={activeSolution === index}
                  >
                    <Icon className={`h-5 w-5 transition-colors ${activeSolution === index ? 'text-accent-200' : 'text-white/45 group-hover:text-accent-300'}`} />
                    <h3 className="mt-5 font-semibold text-white/90">{title}</h3>
                    <span className="mt-2 block font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                      {activeSolution === index ? 'Selected solution' : 'Explore solution'}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-xl border border-accent-400/20 bg-[#0b0f12] p-6 sm:p-8">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    Why it matters
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{selectedSolution.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">{selectedSolution.description}</p>
                  <div className="mt-7 grid gap-2 sm:grid-cols-3">
                    {['Observe', 'Contextualize', 'Respond'].map((step, index) => (
                      <div key={step} className="rounded-lg border border-white/[0.1] bg-white/[0.025] p-3">
                        <div className="font-mono text-[9px] text-accent-300">0{index + 1}</div>
                        <div className="mt-2 text-xs font-medium text-white/75">{step}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={onEnterConsole} className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent-300 hover:text-accent-200">
                    See it in the live console <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-white/30">
          Artemis · satellite fire intelligence for informed action
        </p>
        <button onClick={onEnterConsole} className="inline-flex items-center gap-2 self-start font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accent-300 hover:text-accent-200 sm:self-auto">
          Open live console <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </footer>
    </div>
  );
}
