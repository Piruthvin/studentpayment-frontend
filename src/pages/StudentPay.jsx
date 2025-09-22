import React, { useState } from 'react'
import api from '../api'

export default function StudentPay(){
  const [schoolId, setSchoolId] = useState('65b0e6293e9f76a9694d84b4')
  const [orderAmount, setOrderAmount] = useState(7500)
  const [name, setName] = useState('Test Student')
  const [sid, setSid] = useState('S12345')
  const [phone, setPhone] = useState('9999999999')
  const [email, setEmail] = useState('student@example.com')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorDetails, setErrorDetails] = useState(null)
  const [result, setResult] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setErrorDetails(null)
    setLoading(true)
    try{
      const payload = {
        school_id: schoolId,
        order_amount: Number(orderAmount),
        student_info: { name, id: sid, email, phone }
      }
      const { data } = await api.post('/payments/create-payment', payload)
      setResult(data)
    }catch(ex){
      setError(ex?.response?.data?.message || ex.message)
      setErrorDetails(ex?.response?.data?.error || ex?.response?.data?.missing || null)
    }
    setLoading(false)
  }

  return (
    <div style={{maxWidth:520, margin:'0 auto'}}>
      <div className="card" style={{display:'grid', gap:10}}>
        <h2 style={{margin:0}}>Pay School Fees</h2>
        <form onSubmit={submit} style={{display:'grid', gap:10}}>
          <label>School ID
            <input value={schoolId} onChange={e=>setSchoolId(e.target.value)} required />
          </label>
          <label>Amount (₹)
            <input type="number" min={1} value={orderAmount} onChange={e=>setOrderAmount(e.target.value)} required />
          </label>
          <label>Student Name
            <input value={name} onChange={e=>setName(e.target.value)} required />
          </label>
          <label>Student ID
            <input value={sid} onChange={e=>setSid(e.target.value)} required />
          </label>
          <label>Phone Number
            <input value={phone} onChange={e=>setPhone(e.target.value)} />
          </label>
          <label>Email
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} />
          </label>
          {error && <div className="badge failed">{error}</div>}
          {errorDetails && (
            <pre style={{whiteSpace:'pre-wrap', fontSize:12, opacity:.8, background:'rgba(255,0,0,0.05)', padding:8, borderRadius:6}}>
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          )}
          <button type="submit" disabled={loading} style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:8}}>
            {loading? 'Creating...' : 'Create Payment'}
          </button>
        </form>
      </div>

      {result && (
        <div className="card" style={{marginTop:12}}>
          <h3 style={{marginTop:0}}>Payment Created</h3>
          <div className="footer">custom_order_id: {result.custom_order_id}</div>
          {result.payment_page ? (
            <a className="badge" href={result.payment_page} target="_blank" rel="noreferrer">Open payment page</a>
          ) : (
            <div className="badge">No payment URL returned</div>
          )}
        </div>
      )}
    </div>
  )
}
