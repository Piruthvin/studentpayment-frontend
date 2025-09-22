import React from 'react'
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import Transactions from './pages/Transactions.jsx'
import BySchool from './pages/BySchool.jsx'
import Status from './pages/Status.jsx'
import Login from './pages/Login.jsx'
import StudentPay from './pages/StudentPay.jsx'
import AdminUsers from './pages/AdminUsers.jsx'

function useAuth() {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  return { token, role, isAuthed: !!token }
}

function Private({ children, roles }) {
  const { isAuthed, role } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  if (roles && roles.length && !roles.includes(role)) return <Navigate to={role==='student'? '/pay':'/'} replace />
  return children
}

function Nav() {
  const nav = useNavigate()
  const role = localStorage.getItem('role')
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); nav('/login') }
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  React.useEffect(()=>{
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  },[theme])
  const toggleTheme = () => setTheme(t=> t==='dark' ? 'light' : 'dark')
  return (
    <header style={{display:'flex',gap:16,alignItems:'center',padding:12,borderBottom:'1px solid #eee',position:'sticky',top:0,background:'var(--bg, #fff)',zIndex:10}}>
      <b>School Payments</b>
      <nav style={{display:'flex',gap:12}}>
        {role==='admin' && <Link to="/">Transactions</Link>}
        {role==='admin' && <Link to="/by-school">By School</Link>}
        {role==='admin' && <Link to="/admin/users">Admins</Link>}
        <Link to="/status">Check Status</Link>
        {role==='student' && <Link to="/pay">Pay Fees</Link>}
      </nav>
      <div style={{marginLeft:'auto', display:'flex', gap:8}}>
        <button onClick={toggleTheme} title="Toggle theme">{theme==='dark'? 'Light' : 'Dark'} Mode</button>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  )
}

export default function App() {
  const { isAuthed } = useAuth()
  return (
    <div>
      {isAuthed && <Nav />}
      <div style={{padding:16}}>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route path="/" element={<Private roles={['admin']}><Transactions/></Private>} />
          <Route path="/by-school" element={<Private roles={['admin']}><BySchool/></Private>} />
          <Route path="/admin/users" element={<Private roles={['admin']}><AdminUsers/></Private>} />
          <Route path="/status/*" element={<Private roles={['admin','student']}><Status/></Private>} />
          <Route path="/pay" element={<Private roles={['student']}><StudentPay/></Private>} />
          <Route path="*" element={<Navigate to={isAuthed? (localStorage.getItem('role')==='student'? '/pay':'/'):'/login'} replace/>} />
        </Routes>
      </div>
    </div>
  )
}

