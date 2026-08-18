import TopNav from './components/TopNav'
import Hero from './components/Hero'
import CaseShowcase from './components/CaseShowcase'

function App() {
  return (
    <div className="page-glow flex h-dvh flex-col overflow-hidden">
      <TopNav />
      <main className="flex min-h-0 flex-1 flex-col">
        <Hero />
        <CaseShowcase />
      </main>
    </div>
  )
}

export default App
