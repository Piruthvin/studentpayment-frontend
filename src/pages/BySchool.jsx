import React, { useEffect, useState } from 'react'
import api from '../api'

export default function BySchool(){
  const [schoolId,setSchoolId]=useState('')
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(false)
  const [schools, setSchools] = useState([])
  const checkStatus = async (t) => {
    try{
      if (!t.external_collect_request_id){
        alert('No collect_request_id available for this row yet.')
        return
      }
      await api.get(`/payments/check/${encodeURIComponent(t.external_collect_request_id)}`)
      fetchIt()
    }catch(e){
      alert(e?.response?.data?.error || e.message)
    }
  }

  const fmtINR = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:0, maximumFractionDigits:0 })
  const formatAmount = (v) => (v==null ? '-' : fmtINR.format(Number(v)))

  const fetchIt = async()=>{
    setLoading(true)
    const sid = (schoolId||'').trim()
    const {data} = await api.get(`/transactions/school/${encodeURIComponent(sid)}`)
    setItems(data.items)
    setLoading(false)
  }

  useEffect(()=>{
    api.get('/transactions/schools').then(({data})=>{
      setSchools(data.items||[])
      if (!schoolId && (data.items||[]).length){
        const items = data.items
        const exact = items.find(s=> String(s.school_id).toUpperCase()==='SCHOOL-001')
        if (exact) return setSchoolId(exact.school_id)
        const nonObj = items.find(s=> !/^([a-f0-9]{24})$/i.test(String(s.school_id)))
        if (nonObj) return setSchoolId(nonObj.school_id)
        setSchoolId(items[0].school_id)
      }
    }).catch(()=>{})
  },[])

  useEffect(()=>{ if (schoolId) fetchIt() }, [schoolId])

  return (
    <div>
      <div className="toolbar">
        <select value={schoolId} onChange={e=>setSchoolId(e.target.value)}>
          <option value="">Select school…</option>
          {schools.map((s)=> <option key={s.school_id} value={s.school_id}>{s.name}</option>)}
        </select>
        <button onClick={fetchIt} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:8}}>Fetch</button>
      </div>
      {/* Note: This page uses school_id (friendly dropdown). */}
      <div className="card">
        <table className="table">
          <colgroup>
            <col style={{width:'260px'}} />
            <col style={{width:'240px'}} />
            <col style={{width:'100px'}} />
            <col style={{width:'120px'}} />
            <col style={{width:'140px'}} />
            <col style={{width:'110px'}} />
          </colgroup>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Edviron OrderID</th>
              <th>Gateway</th>
              <th className="col-right">Order Amount</th>
              <th className="col-right">Transaction Amount</th>
              <th className="col-center">Status</th>
              <th className="col-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="6">Loading...</td></tr>}
            {!loading && items.length===0 && <tr><td colSpan="6" style={{opacity:.7}}>No results for "{schoolId}"</td></tr>}
            {!loading && items.map(t=> (
              <tr key={t.custom_order_id}>
                <td>
                  <span className="mono truncate" title={t.collect_id} style={{marginRight:6, display:'inline-block', verticalAlign:'middle'}}>{t.collect_id}</span>
                  <button className="icon-btn" title="Copy Order ID" onClick={()=>navigator.clipboard.writeText(String(t.collect_id||''))} style={{verticalAlign:'middle'}}>📋</button>
                </td>
                <td>
                  <span className="mono truncate" title={t.custom_order_id} style={{marginRight:6, display:'inline-block', verticalAlign:'middle'}}>{t.custom_order_id}</span>
                  <button className="icon-btn" title="Copy Edviron OrderID" onClick={()=>navigator.clipboard.writeText(String(t.custom_order_id||''))} style={{verticalAlign:'middle'}}>📋</button>
                </td>
                <td>{t.gateway}</td>
                <td className="col-right mono">{formatAmount(t.order_amount)}</td>
                <td className="col-right mono">{formatAmount(t.transaction_amount)}</td>
                <td className="col-center"><span className={`badge ${String(t.status).toLowerCase()}`}>{t.status||'NA'}</span></td>
                <td className="col-center"><button className="badge" onClick={()=>checkStatus(t)}>Check</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

