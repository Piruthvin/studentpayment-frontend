import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../api'

function useQuery(){
  const { search } = useLocation()
  return useMemo(()=>Object.fromEntries(new URLSearchParams(search)),[search])
}

export default function Transactions(){
  const q = useQuery()
  const nav = useNavigate()
  const [data,setData]=useState({items:[],total:0,page:1,limit:10})
  const [loading,setLoading]=useState(false)
  const [schools, setSchools] = useState([])

  const page = Number(q.page||1)
  const limit = Number(q.limit||10)
  const status = q.status||''
  const sort = q.sort||'payment_time'
  const order = q.order||'desc'
  const schoolIds = q.schoolIds||''
  const from = q.from||''
  const to = q.to||''
  const searchText = q.search||''
  const [statusMulti, setStatusMulti] = useState((q.status||'').split(',').filter(Boolean))
  const [schoolMulti, setSchoolMulti] = useState((q.schoolIds||'').split(',').filter(Boolean))

  const fetchData = async()=>{
    setLoading(true)
    const {data} = await api.get('/transactions',{ params:{ page, limit, status, sort, order, schoolIds, from, to } })
    setData(data)
    setLoading(false)
  }

  const checkStatus = async (t) => {
    try{
      if (!t.external_collect_request_id){
        alert('No collect_request_id available for this row yet. Create Payment via Edviron to get one.')
        return
      }
      await api.get(`/payments/check/${encodeURIComponent(t.external_collect_request_id)}`)
      fetchData()
    }catch(e){
      alert(e?.response?.data?.error || e.message)
    }
  }

  useEffect(()=>{ fetchData() },[page,limit,status,sort,order,schoolIds,from,to])

  // Load schools for filter dropdown
  useEffect(()=>{
    api.get('/transactions/schools').then(({data})=> setSchools(data.items||[])).catch(()=>{})
  },[])

  const setParam=(k,v)=>{
    const sp = new URLSearchParams(location.search)
    if (v===undefined||v==='') sp.delete(k); else sp.set(k,v)
    nav({search: sp.toString()})
  }

  const items = data.items.filter(it=>{
    if (!searchText) return true
    const blob = Object.values(it).join(' ').toLowerCase()
    return blob.includes(searchText.toLowerCase())
  })

  const copy = async (text) => {
    try{ await navigator.clipboard.writeText(String(text||'')) }catch{}
  }

  // Format INR amounts consistently (symbol + Indian digit grouping), no decimals for whole rupees
  const fmtINR = new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', minimumFractionDigits:0, maximumFractionDigits:0 })
  const formatAmount = (v) => (v==null ? '-' : fmtINR.format(Number(v)))

  // Short date-time: dd/MM/yy hh:mm am/pm (no seconds). Remove comma for compact display
  const fmtDT = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true
  })
  const formatDT = (d) => {
    try{
      if (!d) return '-'
      const s = fmtDT.format(new Date(d)).replace(',', '')
      // Keep am/pm attached to the time so it won't wrap onto next line
      return s.replace(' am', '\u00A0am').replace(' pm', '\u00A0pm')
    }catch{ return '-' }
  }

  const exportCsv = () => {
    const header = [
      'sr.no', 'institute name', 'date and time', 'order id', 'edviron orderid',
      'order amount', 'transaction amt', 'payment method', 'status', 'student name',
      'student id', 'phonenumber', 'vendoramt', 'gateway', 'capture status'
    ]
    const rows = items.map((t, idx) => [
      String((page-1)*limit + idx + 1),
      t.school_name ?? t.school_id ?? '-',
      formatDT(t.payment_time),
      t.collect_id ?? '-',
      t.custom_order_id ?? '-',
      t.order_amount ?? '-',
      t.transaction_amount ?? '-',
      t.payment_mode ?? '-',
      t.status ?? '-',
      t.student_name ?? '-',
      t.student_id ?? '-',
      t.phone ?? '-',
      t.vendor_amount ?? '-',
      t.gateway ?? '-',
      t.capture_status ?? '-'
    ])
    const escape = (v) => {
      const s = String(v ?? '')
      if (s.includes(',') || s.includes('\n') || s.includes('"')) return '"' + s.replace(/"/g,'""') + '"'
      return s
    }
    const csv = [header, ...rows].map(r => r.map(escape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_export_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="toolbar" style={{display:'flex', gap:8, justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <input type="search" placeholder="Search..." value={searchText} onChange={e=>setParam('search',e.target.value)}/>
          <button onClick={()=>setParam('search', searchText)}>Search</button>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
          {/* Multi-select Status */}
          <select multiple value={statusMulti} onChange={e=>{
              const vals = Array.from(e.target.selectedOptions).map(o=>o.value)
              setStatusMulti(vals)
              setParam('status', vals.join(','))
            }} style={{minWidth:140,height:38}} title="Status (multi)">
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          {/* Multi-select Schools */}
          <select multiple value={schoolMulti} onChange={e=>{
              const vals = Array.from(e.target.selectedOptions).map(o=>o.value)
              setSchoolMulti(vals)
              setParam('schoolIds', vals.join(','))
            }} style={{minWidth:180,height:38}} title="Schools (multi)">
            {schools.map(s=> <option key={s.school_id} value={s.school_id}>{s.name}</option>)}
          </select>
          {/* Date range: from + to */}
          <input type="date" value={from} onChange={e=>setParam('from',e.target.value)} title="From date" />
          <input type="date" value={to} onChange={e=>setParam('to',e.target.value)} title="To date" />
          <select value={sort} onChange={e=>setParam('sort',e.target.value)}>
            <option value="payment_time">Payment Time</option>
            <option value="status">Status</option>
            <option value="transaction_amount">Txn Amount</option>
          </select>
          <select value={order} onChange={e=>setParam('order',e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
          <select value={limit} onChange={e=>setParam('limit',e.target.value)}>
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
          <Link to="/status" className="badge">Check a status</Link>
          <button onClick={exportCsv} className="badge">Export</button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <colgroup>
            <col style={{width:'56px'}} />
            <col style={{width:'160px'}} />
            <col style={{width:'160px'}} />
            <col style={{width:'240px'}} />
            <col style={{width:'240px'}} />
            <col style={{width:'110px'}} />
            <col style={{width:'120px'}} />
            <col style={{width:'110px'}} />
            <col style={{width:'110px'}} />
            <col style={{width:'140px'}} />
            <col style={{width:'110px'}} />
            <col style={{width:'120px'}} />
            <col style={{width:'110px'}} />
            <col style={{width:'90px'}} />
            <col style={{width:'120px'}} />
          </colgroup>
          <thead>
            <tr>
              <th className="col-center">Sr.No</th>
              <th>Institute Name</th>
              <th className="nowrap">Date and Time</th>
              <th>Order ID</th>
              <th>Edviron OrderID</th>
              <th className="col-right">Order Amount</th>
              <th className="col-right">Transaction Amt</th>
              <th>Payment Method</th>
              <th className="col-center">Status</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Phone Number</th>
              <th className="col-right">Vendor Amt</th>
              <th>Gateway</th>
              <th>Capture Status</th>
              <th className="col-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="15">Loading...</td></tr>}
            {!loading && items.map((t, idx)=> (
              <tr key={t.custom_order_id}>
                <td className="col-center mono">{(page-1)*limit + idx + 1}</td>
                <td>{t.school_name ?? t.school_id}</td>
                <td className="nowrap mono">{formatDT(t.payment_time)}</td>
                <td>
                  <span className="mono truncate" title={t.collect_id} style={{marginRight:6, display:'inline-block', verticalAlign:'middle'}}>{t.collect_id}</span>
                  <button className="icon-btn" title="Copy Order ID" onClick={()=>copy(t.collect_id)} style={{verticalAlign:'middle'}}>📋</button>
                </td>
                <td>
                  <span className="mono truncate" title={t.custom_order_id} style={{marginRight:6, display:'inline-block', verticalAlign:'middle'}}>{t.custom_order_id}</span>
                  <button className="icon-btn" title="Copy Edviron OrderID" onClick={()=>copy(t.custom_order_id)} style={{verticalAlign:'middle'}}>📋</button>
                </td>
                <td className="col-right mono">{formatAmount(t.order_amount)}</td>
                <td className="col-right mono">{formatAmount(t.transaction_amount)}</td>
                <td>{t.payment_mode ?? '-'}</td>
                <td className="col-center"><span className={`badge ${String(t.status).toLowerCase()}`}>{t.status||'NA'}</span></td>
                <td>{t.student_name ?? '-'}</td>
                <td className="mono">{t.student_id ?? '-'}</td>
                <td className="mono">{t.phone ?? '-'}</td>
                <td className="col-right mono">{formatAmount(t.vendor_amount)}</td>
                <td>{t.gateway ?? '-'}</td>
                <td>{t.capture_status ?? '-'}</td>
                <td className="col-center">
                  <button className="badge" title="Check status" onClick={()=>checkStatus(t)}>Check</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="toolbar" style={{justifyContent:'space-between'}}>
          <div className="footer">Total: {data.total}</div>
          <div style={{display:'flex',gap:8}}>
            <button disabled={page<=1} onClick={()=>setParam('page', String(page-1))}>Prev</button>
            <div style={{display:'grid',placeItems:'center',minWidth:60}}>Page {page}</div>
            <button disabled={page*limit>=data.total} onClick={()=>setParam('page', String(page+1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}
