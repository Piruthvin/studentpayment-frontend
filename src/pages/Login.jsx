import React, { useState } from 'react'
import api from '../api'

export default function Login(){
  const [email,setEmail]=useState('admin@example.com')
  const [password,setPassword]=useState('secret123')
  const [name,setName]=useState('Admin')
  const [mode,setMode]=useState('login')
  const [err,setErr]=useState('')

  const submit=async(e)=>{
    e.preventDefault();
    setErr('')
    try{
      const endpoint = mode==='login'? '/auth/login':'/auth/register'
      const body = mode==='login'? {email,password}:{email,password,name}
      const {data}=await api.post(endpoint, body)
      localStorage.setItem('token', data.token)
      if (data?.user?.role) localStorage.setItem('role', data.user.role)
      const next = data?.user?.role==='student' ? '/pay' : '/'
      window.location.href=next
    }catch(ex){
      setErr(ex?.response?.data?.message||'Failed')
    }
  }

  return (
    <div style={{display:'grid',placeItems:'center',height:'100%'}}>
      <form onSubmit={submit} className="card" style={{minWidth:320,display:'grid',gap:10}}>
        <h2 style={{margin:0}}>Welcome</h2>
        <small style={{opacity:.7}}>Use register once, then login</small>
        <label>Email
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/>
        </label>
        <label>Password
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/>
        </label>
        {mode==='register' && (
          <label>Name
            <input value={name} onChange={e=>setName(e.target.value)} required/>
          </label>
        )}
        {err && <div className="badge failed">{err}</div>}
        <button type="submit" style={{background:'var(--accent)',border:'none',color:'#fff',borderRadius:8}}> {mode==='login'? 'Login':'Register'} </button>
        <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'? 'Need an account? Register':'Have an account? Login'}</button>
      </form>
    </div>
  )
}
