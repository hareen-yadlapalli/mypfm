// src/screens/HomeScreen/HomeScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Pie, Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './HomeScreen.css';

export default function HomeScreen() {
  const [allTxns,    setAllTxns]    = useState([]);
  const [startDate,  setStartDate]  = useState(null);
  const [endDate,    setEndDate]    = useState(null);
  const [direction,  setDirection]  = useState('All');
  const [category,   setCategory]   = useState('All');
  const [status,     setStatus]     = useState('All');
  const [property,   setProperty]   = useState('All');
  const [account,    setAccount]    = useState('All');

  useEffect(() => {
    fetch('http://localhost:5000/api/transactions')
      .then(r=>r.json())
      .then(setAllTxns)
      .catch(console.error);
  }, []);

  const toDate = d => d ? new Date(d) : null;

  const categories = useMemo(() => ['All', ...new Set(allTxns.map(t=>t.category))], [allTxns]);
  const statuses   = useMemo(() => ['All', ...new Set(allTxns.map(t=>t.status))],   [allTxns]);
  const directions = ['All','Income','Expense'];
  const properties = useMemo(() => ['All', ...new Set(allTxns.map(t=>t.propertyLabel))], [allTxns]);
  const accounts   = useMemo(() => ['All', ...new Set(allTxns.map(t=>t.accountLabel))],  [allTxns]);

  const filtered = useMemo(() => allTxns
      .filter(t => {
        const d = toDate(t.transactiondate);
        if (startDate && d < startDate) return false;
        if (endDate   && d > endDate)   return false;
        return true;
      })
      .filter(t => direction==='All' ? true : t.direction===direction)
      .filter(t => category==='All'  ? true : t.category===category)
      .filter(t => status==='All'    ? true : t.status===status)
      .filter(t => property==='All'  ? true : t.propertyLabel===property)
      .filter(t => account==='All'   ? true : t.accountLabel===account)
      .sort((a,b)=>toDate(a.transactiondate)-toDate(b.transactiondate))
  , [allTxns, startDate, endDate, direction, category, status, property, account]);

  const totalIncome  = useMemo(()=> filtered.filter(t=>t.direction==='Income')
    .reduce((sum,t)=>sum+parseFloat(t.amount),0)
  , [filtered]);
  const totalExpense = useMemo(()=> filtered.filter(t=>t.direction==='Expense')
    .reduce((sum,t)=>sum+parseFloat(t.amount),0)
  , [filtered]);
  const net = totalIncome - totalExpense;

  const pieData = {
    labels: ['Income','Expense'],
    datasets:[{ data:[totalIncome,totalExpense], backgroundColor:['#4caf50','#f44336'] }]
  };

  const expenseByCat = useMemo(() => {
    const m = {};
    filtered.filter(t=>t.direction==='Expense').forEach(t=>{
      m[t.category] = (m[t.category]||0) + parseFloat(t.amount);
    });
    return m;
  }, [filtered]);
  const barData = {
    labels: Object.keys(expenseByCat),
    datasets:[{ label:'Expense', data:Object.values(expenseByCat), backgroundColor:'#f44336' }]
  };

  const monthly = useMemo(() => {
    const m = {};
    filtered.forEach(t=>{
      const d = toDate(t.transactiondate);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      m[key] = (m[key]||0) + (t.direction==='Income'? parseFloat(t.amount) : -parseFloat(t.amount));
    });
    const keys = Object.keys(m).sort();
    return { labels: keys, data: keys.map(k=>m[k]) };
  }, [filtered]);
  const lineData = {
    labels: monthly.labels,
    datasets:[{ label:'Net', data:monthly.data, fill:false, tension:0.3 }]
  };

  const top5 = useMemo(() => {
    const entries = Object.entries(expenseByCat)
      .sort((a,b)=>b[1]-a[1])
      .slice(0,5);
    return {
      labels: entries.map(e=>e[0]),
      datasets:[{ data: entries.map(e=>e[1]), backgroundColor:['#e57373','#ef5350','#f44336','#d32f2f','#b71c1c'] }]
    };
  }, [expenseByCat]);

  return (
    <div className="home">
      <h2>📊 Dashboard</h2>

      <div className="controls">
        <div className="filter-group">
          <label>Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select…"
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="Select…"
          />
        </div>
        <div className="filter-group">
          <label>Direction</label>
          <select value={direction} onChange={e=>setDirection(e.target.value)}>
            {directions.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={category} onChange={e=>setCategory(e.target.value)}>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            {statuses.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Property</label>
          <select value={property} onChange={e=>setProperty(e.target.value)}>
            {properties.map(p=> <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Account</label>
          <select value={account} onChange={e=>setAccount(e.target.value)}>
            {accounts.map(a=> <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {(!startDate||!endDate) ? (
        <p className="notice">Select both dates to view the dashboard.</p>
      ) : (
        <>
          <div className="totals">
            <div className="card income">
              <h3>Total Income</h3>
              <p>${totalIncome.toFixed(2)}</p>
            </div>
            <div className="card expense">
              <h3>Total Expense</h3>
              <p>${totalExpense.toFixed(2)}</p>
            </div>
            <div className={`card net ${net>=0?'positive':'negative'}`}>
              <h3>Net</h3>
              <p>${net.toFixed(2)}</p>
            </div>
          </div>

          <div className="charts">
            <div className="chart"><h4>Income vs Expense</h4><Pie data={pieData}/></div>
            <div className="chart"><h4>Expense by Category</h4>
              {barData.labels.length ? <Bar data={barData}/> : <p className="notice">No expenses</p>}
            </div>
            <div className="chart"><h4>Monthly Net Trend</h4>
              {lineData.labels.length ? <Line data={lineData}/> : <p className="notice">No data</p>}
            </div>
            <div className="chart"><h4>Top-5 Expense Categories</h4>
              {top5.labels.length ? <Pie data={top5}/> : <p className="notice">No expenses</p>}
            </div>
          </div>

          <div className="table-section">
            <h4>Transactions</h4>
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Date</th><th>Name</th><th>Dir.</th><th>Status</th>
                  <th>Amount</th><th>Category</th><th>Property</th><th>Account</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t,i)=>(
                  <tr key={i}>
                    <td>{t.transactiondate.split('T')[0]}</td>
                    <td>{t.name}</td>
                    <td>{t.direction}</td>
                    <td>{t.status}</td>
                    <td style={{ color: t.direction==='Expense' ? 'red' : 'green' }}>
                      ${parseFloat(t.amount).toFixed(2)}
                    </td>
                    <td>{t.category}</td>
                    <td>{t.propertyLabel}</td>
                    <td>{t.accountLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
