import React, { useState, useEffect } from 'react';

const API_BASE = "worker.nasserl.workers.dev"; // ←ここ重要！

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [orders, setOrders] = useState([]);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = async () => {
    const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } });
    const data = await res.json();
    if (data.orders) setOrders(data.orders);
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/api/auth`, { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { setIsLoggedIn(true); localStorage.setItem('admin_pw', password); refresh(); } else { alert("認証失敗"); }
  };

  const handleComplete = async (orderId: number, userId: string) => {
    const fileInput = document.getElementById(`file-${orderId}`) as HTMLInputElement;
    if (!fileInput.files?.[0]) return alert("画像を選んでください");
    const formData = new FormData();
    formData.append('id', orderId.toString());
    formData.append('userId', userId);
    formData.append('image', fileInput.files[0]);

    const res = await fetch(`${API_BASE}/api/admin/complete`, { method: 'POST', headers: { 'Authorization': password }, body: formData });
    if (res.ok) { alert("完了！"); refresh(); }
  };

  useEffect(() => { if (isAdmin && password) login(); }, []);

  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={{background:'#000', color:'#fff', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1>Wei Admin</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{padding:'10px', margin:'10px'}} placeholder="Password" />
        <button onClick={login}>ENTER</button>
      </div>
    );

    return (
      <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
        <h2>代行管理司令塔</h2>
        {orders.map((o: any) => (
          <div key={o.id} style={{background:'#222', padding:'15px', borderRadius:'10px', marginBottom:'10px', border:'1px solid #333'}}>
            <strong>#{o.id} {o.username}</strong>
            <div style={{margin:'10px 0'}}><code>{o.transferCode} / {o.authPassword}</code></div>
            <input type="file" id={`file-${o.id}`} accept="image/*" />
            <button onClick={() => handleComplete(o.id, o.userId)} style={{background:'#009944', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', marginLeft:'10px'}}>画像送信完了</button>
          </div>
        ))}
      </div>
    );
  }

  return <div style={{background:'#111', color:'#fff', height:'100vh', padding:'50px', textAlign:'center'}}><h1>Wei代行</h1><p>注文はDiscordから</p></div>;
}
