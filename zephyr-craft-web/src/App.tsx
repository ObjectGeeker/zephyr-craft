import { Route, Routes } from 'react-router-dom'
import TopNav from './components/TopNav'
import Hero from './components/Hero'
import CaseShowcase from './components/CaseShowcase'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import { UserProvider } from './store/user'

function HomePage() {
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

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </UserProvider>
  )
}

export default App
