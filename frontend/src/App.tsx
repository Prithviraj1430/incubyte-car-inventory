import { useState } from 'react'

type AuthMode = 'login' | 'register'

function App() {
  const [mode, setMode] = useState<AuthMode>('login')
  const isRegistering = mode === 'register'

  return (
    <div className="min-h-screen bg-[#eef0ed] p-3 text-[#172332] sm:p-6">
      <main className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] bg-[#fafaf7] shadow-[0_24px_80px_rgba(19,34,48,0.12)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.08fr_0.92fr]">
        <section
          className="relative hidden min-h-[720px] flex-col overflow-hidden bg-[#142a37] px-12 py-11 text-white lg:flex xl:px-16"
          aria-label="Auto Atelier introduction"
        >
          <div className="absolute -right-32 -top-36 h-[450px] w-[450px] rounded-full border border-white/10" />
          <div className="absolute -right-16 -top-20 h-[450px] w-[450px] rounded-full border border-white/10" />
          <div className="absolute bottom-28 left-0 h-px w-full bg-white/10" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="text-lg font-bold tracking-[0.2em]">
              AUTO<span className="text-[#eaa678]">.</span>ATELIER
            </div>
            <span className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold tracking-[0.2em] text-white/70 uppercase">
              The modern showroom
            </span>
          </div>

          <div className="relative z-10 mt-24 max-w-xl">
            <p className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-[#efb288] uppercase">
              <span className="h-px w-9 bg-[#efb288]" />
              Find your next drive
            </p>
            <h2 className="font-serif text-[clamp(4.4rem,6vw,7.5rem)] leading-[0.91] tracking-[-0.055em]">
              The road
              <br />
              looks better
              <br />
              <em className="font-normal text-[#efb288]">from here.</em>
            </h2>
            <p className="mt-8 max-w-sm text-base leading-8 text-[#c2cdd1]">
              An easier way to discover exceptional cars, explore live
              availability, and make your next move with confidence.
            </p>
          </div>

          <div className="relative z-10 mt-auto pt-14">
            <div className="h-[300px] w-full overflow-hidden rounded-2xl bg-[#142a37]">
  <img
    src="/showroom-hero.png"
    alt="Contemporary crossover in a dark studio"
    className="h-full w-full object-cover object-[center_60%]"
  />
</div>
            <div className="mt-7 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/55">
              <span>CURATED CARS. CLEAR CHOICES.</span>
              <span>EST. 2026</span>
            </div>
          </div>
        </section>

        <section className="flex min-h-[680px] flex-col px-6 py-8 sm:px-12 sm:py-11 xl:px-20">
          <div className="flex items-center justify-between lg:justify-end">
            <span className="text-sm font-bold tracking-[0.18em] lg:hidden">
              AUTO<span className="text-[#c56f48]">.</span>ATELIER
            </span>
            <span className="text-xs font-medium text-[#829098]">
              YOUR SHOWROOM ACCESS
            </span>
          </div>

          <div className="my-auto w-full max-w-[420px] self-center py-16">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8ece9] text-xl text-[#1c414a]">
              ✦
            </div>
            <p className="text-xs font-bold tracking-[0.24em] text-[#b46a49] uppercase">
              {isRegistering ? 'Start your journey' : 'Good to see you'}
            </p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.045em] sm:text-[3.5rem]">
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#67747b]">
              {isRegistering
                ? 'Join the showroom to browse available vehicles and find your next drive.'
                : 'Sign in to explore the collection and manage your next move.'}
            </p>

            <form
              className="mt-9 space-y-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <div>
                <label
                  className="mb-2 block text-sm font-semibold"
                  htmlFor="email"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#dce2de] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#315d61] focus:ring-4 focus:ring-[#315d61]/10"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    isRegistering ? 'new-password' : 'current-password'
                  }
                  minLength={isRegistering ? 12 : undefined}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#dce2de] bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#315d61] focus:ring-4 focus:ring-[#315d61]/10"
                />
                {isRegistering && (
                  <p className="mt-2 text-xs text-[#7b878b]">
                    Use at least 12 characters.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#183d45] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(24,61,69,0.16)] transition hover:bg-[#285761] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183d45]"
              >
                {isRegistering ? 'Register' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <span className="h-px flex-1 bg-[#e0e5e1]" />
              <span className="text-xs text-[#93a09e]">
                {isRegistering ? 'Already a member?' : 'New to the showroom?'}
              </span>
              <span className="h-px flex-1 bg-[#e0e5e1]" />
            </div>
            <button
              type="button"
              onClick={() => setMode(isRegistering ? 'login' : 'register')}
              className="mt-5 w-full rounded-xl border border-[#dce2de] bg-white px-5 py-3.5 text-sm font-semibold text-[#24434b] transition hover:border-[#8eaaa9] hover:bg-[#f2f6f3]"
            >
              {isRegistering ? 'Back to sign in' : 'Create account'}
            </button>
          </div>

          <div className="text-center text-xs text-[#94a09f]">
            A better way to move forward.
          </div>
        </section>
      </main>
    </div>
  )
}

export default App