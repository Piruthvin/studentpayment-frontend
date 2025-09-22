import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import api from '../api'

function StatusHome(){
  const [id,setId]=useState('')
  const nav = useNavigate()
  return (
    <div className="card" style={{display:'grid',gap:10,maxWidth:500}}>
      <h3 style={{margin:0}}>Check Transaction Status</h3>
      <input placeholder="custom_order_id" value={id} onChange={e=>setId(e.target.value)} />
      <button onClick={()=>nav(`/status/${encodeURIComponent(id)}`)} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:8}}>Check</button>
      <CreatePaymentDemo />
    </div>
  )
}

function StatusDetails(){
  const { id } = useParams()
  const [data,setData]=useState(null)
  const [err,setErr]=useState('')
  useEffect(()=>{
    async function go(){
      try{
        const {data} = await api.get(`/transactions/status/${encodeURIComponent(id)}`)
        setData(data)
      }catch(ex){ setErr('Not found') }
    }
    go()
  },[id])

  return (
    <div className="card" style={{display:'grid',gap:8}}>
      <h3 style={{margin:0}}>Status for {id}</h3>
      {err && <div className="badge failed">{err}</div>}
      {data && (
        <ul style={{listStyle:'none',padding:0,margin:0}}>
          <li><b>school_id:</b> {data.school_id}</li>
          <li><b>gateway:</b> {data.gateway}</li>
          <li><b>order_amount:</b> ₹{data.order_amount}</li>
          <li><b>transaction_amount:</b> ₹{data.transaction_amount ?? '-'}</li>
          <li><b>status:</b> <span className={`badge ${String(data.status).toLowerCase()}`}>{data.status || 'NA'}</span></li>
          <li><b>payment_time:</b> {data.payment_time ? new Date(data.payment_time).toLocaleString():'-'}</li>
        </ul>
      )}
    </div>
  )
}

function CreatePaymentDemo(){
  const [loading,setLoading]=useState(false)
  const [url,setUrl]=useState('')
  const [last,setLast]=useState(null)
  const demo=async()=>{
    setLoading(true)
    setUrl('')
    const payload={
      school_id: '65b0e6293e9f76a9694d84b4',
      order_amount: 7500,
      student_info: { name:'Test Student', id:'S12345', email:'student@example.com' }
    }
    try{
      const {data} = await api.post('/payments/create-payment', payload)
      setLast(data)
      setUrl(data.payment_page||'')
    }catch(ex){
      alert('Create payment failed: ' + (ex?.response?.data?.message||ex.message))
    }
    setLoading(false)
  }
  return (
    <div className="card" style={{marginTop:12}}>
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <b>Demo:</b>
        <button disabled={loading} onClick={demo} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:8}}>Create Payment</button>
        {url && <a href={url} target="_blank" rel="noreferrer" className="badge">Open payment page</a>}
      </div>
      {last && <small className="footer">custom_order_id: {last.custom_order_id}</small>}
    </div>
  )
}

export default function Status(){
  return (
    <Routes>
      <Route index element={<StatusHome/>} />
      <Route path=":id" element={<StatusDetails/>} />
    </Routes>
  )
}
