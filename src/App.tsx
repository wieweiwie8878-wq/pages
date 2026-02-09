import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkers
const PRODUCTS = [
  { id: 'neko', name: '猫缶カンスト', price: 80, desc: '猫缶を最大まで補充します' },
  { id: 'xp', name: 'XPカンスト', price: 80, desc: '経験値を最大まで補充します' },
  { id: 'all_c', name: '全キャラ解放', price: 150, desc: '全キャラクターを使用可能にします' },
  { id: 'strong', name: '最強初期垢セット', price: 500, desc: '猫缶+XP+全キャラ解放済みの新規垢' },
  { id: 'ban', name: '🛡️ BAN保証', price: 500, desc: '万が一のBAN時に無償で復旧します' }
];

const getBrowserId = () => {
  let id = localStorage.getItem('wei_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('wei_id', id);
  }
  return id;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const [cart, setCart] = useState<string[]>([]);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const login = async () => {
    const res = await fetch(`${API_BASE}/api/auth`, { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { setIsLoggedIn(true); localStorage.setItem('admin_pw', password); refresh(); }
  };

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const totalPrice = cart.reduce((s, id) => s + (PRODUCTS.find(p => p.id === id)?.price || 0), 0);
    const order = {
      username: fd.get('un'),
      tc: fd.get('tc'),
      ap: fd.get('ap'),
      paypayUrl: fd.get('p'),
      services: cart.map(id => PRODUCTS.find(p => p.id === id)?.name).join(', '),
      total: totalPrice,
      browserId: getBrowserId()
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("ご注文を承りました！"); window.location.reload(); }
  };

  useEffect(() => { if (isAdmin && password) login(); }, []);

  if (isAdmin) {
    return (
      <div style={{background:'#0a0a0a', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'"Helvetica Neue", Arial, sans-serif'}}>
        <h1 style={{borderLeft:'4px solid #4af', paddingLeft:'15px'}}>Admin Dashboard</h1>
        {data?.orders?.map((o: any) => (
          <div key={o.id} style={{background:'#1a1a1a', margin:'15px 0', padding:'20px', borderRadius:'10px', border:'1px solid #333'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <span style={{fontWeight:'bold'}}>#{o.id} {o.username}</span>
              <span style={{color:'#ff4444', fontSize:'12px'}}>IP: {o.ipAddress}</span>
            </div>
            <p style={{color:'#aaa', fontSize:'14px'}}>{o.services} / ¥{o.totalPrice}</p>
            <div style={{background:'#000', padding:'10px', marginTop:'10px', borderRadius:'5px'}}>
              <code>Code: {o.transferCode} | Pass: {o.authPassword}</code>
            </div>
            <a href={o.paypayUrl} target="_blank" style={{display:'inline-block', marginTop:'10px', color:'#4af'}}>PayPayを確認</a>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{background:'#f5f5f7', color:'#1d1d1f', minHeight:'100vh', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      {/* Navbar */}
      <nav style={{background:'#fff', padding:'15px 20px', borderBottom:'1px solid #d2d2d7', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{fontSize:'20px', fontWeight:'bold', letterSpacing:'1px'}}>WEI 代行 SHOP</span>
        <span style={{fontSize:'12px', color:'#86868b'}}>Made in Japan Quality</span>
      </nav>

      <div style={{maxWidth:'900px', margin:'40px auto', padding:'0 20px'}}>
        <h2 style={{fontSize:'32px', textAlign:'center', marginBottom:'40px'}}>商品ラインナップ</h2>
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'20px'}}>
          {PRODUCTS.map(p => (
            <div key={p.id} style={{background:'#fff', padding:'25px', borderRadius:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
              <div>
                <h3 style={{fontSize:'20px', margin:'0 0 10px 0'}}>{p.name}</h3>
                <p style={{fontSize:'14px', color:'#86868b', lineHeight:'1.5'}}>{p.desc}</p>
              </div>
              <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{fontSize:'22px', fontWeight:'600'}}>¥{p.price}</span>
                <button 
                  onClick={() => setCart(prev => prev.includes(p.id) ? prev.filter(x => x!==p.id) : [...prev, p.id])}
                  style={{background: cart.includes(p.id) ? '#1d1d1f' : '#0071e3', color:'#fff', border:'none', padding:'8px 20px', borderRadius:'20px', cursor:'pointer', fontSize:'14px'}}
                >
                  {cart.includes(p.id) ? '削除' : '選択する'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div style={{marginTop:'50px', background:'#fff', padding:'30px', borderRadius:'24px', boxShadow:'0 10px 40px rgba(0,0,0,0.1)'}}>
            <h2 style={{marginBottom:'20px', textAlign:'center'}}>注文手続き</h2>
            <form onSubmit={handleOrder} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              <input name="un" placeholder="お名前（Discord名など）" style={inputS} required />
              <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
              <input name="ap" placeholder="認証番号" style={inputS} required />
              <textarea name="p" placeholder="PayPay受取リンクを貼り付け" style={{...inputS, height:'80px'}} required />
              <div style={{textAlign:'center', padding:'20px', fontSize:'24px', fontWeight:'bold'}}>
                合計: ¥{cart.reduce((s, id) => s + (PRODUCTS.find(p => p.id === id)?.price || 0), 0)}
              </div>
              <button type="submit" style={{background:'#0071e3', color:'#fff', border:'none', padding:'18px', borderRadius:'14px', fontSize:'18px', fontWeight:'bold', cursor:'pointer'}}>注文を確定して送信</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const inputS = { padding:'15px', borderRadius:'12px', border:'1px solid #d2d2d7', fontSize:'16px', background:'#f5f5f7' };
