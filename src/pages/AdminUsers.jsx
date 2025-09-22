import React, { useState } from 'react'
import api from '../api'

export default function AdminUsers(){
  const [email, setEmail] = useState('newadmin@example.com')
  const [name, setName] = useState('New Admin')
  const [password, setPassword] = useState('secret123')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    setLoading(true)
    try{
      const { data } = await api.post('/auth/admin/create', { email, name, password })
      setMsg(`Created admin: ${data.email}`)
    }catch(ex){
      setErr(ex?.response?.data?.message || ex.message)
    }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:520, margin:'0 auto'}}>
      <div className="card" style={{display:'grid', gap:10}}>
        <h2 style={{margin:0}}>Create Admin</h2>
        <form onSubmit={submit} style={{display:'grid', gap:10}}>
          <label>Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </label>
          <label>Name
            <input value={name} onChange={e=>setName(e.target.value)} required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </label>
          {err && <div className="badge failed">{err}</div>}
          {msg && <div className="badge success">{msg}</div>}
          <button type="submit" disabled={loading} style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:8}}>
            {loading? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}
