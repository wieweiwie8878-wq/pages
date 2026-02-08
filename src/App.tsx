import React, { useState, useEffect } from 'react';

const API_BASE = "https://apiindex.nasserl.workers.dev"; // あなたのWorkersのURL
const STATUS_MAP: any = {
  pending: { label: '⏳ 未着手', color: '#ffcc00' },
  working: { label: '🛠 進行中', color: '#00ccff' },
  completed: { label: '✅ 完了', color: '#00ff66' }
};

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);

  const apiFetch = async (path: string, method = 'GET', body?: any) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Authorization': password, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (res.status === 401) {
      setIsLoggedIn(false);
      localStorage.removeItem('admin_pw');
      return { error: 'Unauthorized' };
    }
    return res.json();
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      setIsLoggedIn(true);
      localStorage.setItem('admin_pw', password);
    } else { alert("パスワードが違います"); }
  };

  const refresh = () => { if (isLoggedIn) apiFetch('/admin/stats').then(setData); };
  const updateStatus = async (id: number, status: string) => { await apiFetch('/admin/update-status', 'POST', { id, status }); refresh(); };
  const scrub = async (id: number) => { if (confirm("消去しますか？")) { await apiFetch('/admin/scrub', 'POST', { id }); refresh(); } };
  const toggleShop = async (current: boolean) => { await apiFetch('/admin/toggle', 'POST', { open: !current }); refresh(); };

  useEffect(() => { if (password && !isLoggedIn) login(); }, []);
  useEffect(() => { if (isLoggedIn) refresh(); }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <div style={{background:'#000', color:'#fff', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <h1 style={{color:'#4af'}}>代行管理</h1>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{padding:'12px', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'#fff', textAlign:'center'}} placeholder="Password" />
      <button onClick={login} style={{background:'#4af', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'8px', marginTop:'15px', cursor:'pointer', fontWeight:'bold'}}>ログイン</button>
    </div>
  );

  return (
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'900px', margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', background:'#222', padding:'20px', borderRadius:'15px', border:'1px solid #333', marginBottom:'20px'}}>
          <div>
            <h1 style={{margin:0, fontSize:'20px', color:'#4af'}}>注文管理ダッシュボード</h1>
            <p style={{margin:0, color:'#4f4'}}>今日の売上: ¥{data?.todaySales || 0}</p>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={refresh} style={{background:'#444', color:'#fff', border:'none', padding:'10px', borderRadius:'8px', cursor:'pointer'}}>↻ 更新</button>
            <button onClick={() => toggleShop(data?.isShopOpen)} style={{background: data?.isShopOpen ? '#28a745' : '#dc3545', color:'#fff', border:'none', padding:'10px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
              店舗: {data?.isShopOpen ? "OPEN" : "CLOSED"}
            </button>
          </div>
        </div>

        <div style={{display:'grid', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#222', border:'1px solid #444', borderRadius:'12px', padding:'20px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                <span style={{background:'#4af', color:'#000', padding:'2px 8px', borderRadius:'4px', fontWeight:'bold'}}>#{o.id} {o.username}</span>
                <div style={{textAlign:'right'}}>
                   <p style={{margin:0, color: STATUS_MAP[o.status]?.color, fontWeight:'bold'}}>{STATUS_MAP[o.status]?.label}</p>
                   <p style={{margin:0, fontSize:'18px'}}>¥{o.totalPrice}</p>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                <div style={{background:'#000', padding:'10px', borderRadius:'8px'}}><p style={{fontSize:'10px', color:'#888', margin:0}}>🗝️ 引き継ぎコード</p><p style={{color:'#fa0', margin:0, fontFamily:'monospace'}}>{o.transferCode}</p></div>
                <div style={{background:'#000', padding:'10px', borderRadius:'8px'}}><p style={{fontSize:'10px', color:'#888', margin:0}}>🔐 認証番号</p><p style={{color:'#fa0', margin:0, fontFamily:'monospace'}}>{o.authPassword}</p></div>
              </div>
              <div style={{fontSize:'13px', color:'#ccc', background:'#1a1a1a', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>内容: {o.services?.join(', ')}<br/>詳細: {o.details}</div>
              <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                <button onClick={() => updateStatus(o.id, 'working')} style={{flex:1, background:'#0066cc', color:'#fff', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}>🛠 進行中</button>
                <button onClick={() => updateStatus(o.id, 'completed')} style={{flex:1, background:'#009944', color:'#fff', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}>✅ 完了</button>
                <button onClick={() => scrub(o.id)} style={{flex:1, background:'#cc3300', color:'#fff', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer'}}>個人抹消</button>
                <a href={o.paypayUrl} target="_blank" style={{flex:1, background:'#fff', color:'#000', textDecoration:'none', textAlign:'center', padding:'8px', borderRadius:'6px', fontWeight:'bold'}}>PayPay</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
