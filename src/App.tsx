import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkersのURL
const PRODUCTS = [
  { id: 'neko', name: '猫缶カンスト', price: 80, tag: '人気No.1' },
  { id: 'xp', name: 'XPカンスト', price: 80, tag: '爆速' },
  { id: 'all_c', name: '全キャラ解放', price: 150, tag: '最強' },
  { id: 'strong', name: '最強初期垢', price: 500, tag: '即納' },
  { id: 'ban', name: 'BAN保証', price: 500, tag: '安心' }
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
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);

  const handleOrder = async (e: any) => {
    e.preventDefault();
    if (selected.length === 0) return alert("商品を選択してください");
    const fd = new FormData(e.target);
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: selected.map(id => PRODUCTS.find(p => p.id === id)?.name).join(','),
      total: selected.reduce((s, id) => s + (PRODUCTS.find(p => p.id === id)?.price || 0), 0),
      browserId: getBrowserId()
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文が完了しました！"); window.location.reload(); }
  };

  useEffect(() => { if (isAdmin && password) refresh(); }, []);

  if (isAdmin) {
    return (
      <div style={{background:'#f6f8fa', color:'#333', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
        <h1>管理者ダッシュボード</h1>
        {data?.orders?.map((o: any) => (
          <div key={o.id} style={{background:'#fff', margin:'10px 0', padding:'15px', borderRadius:'8px', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
            <strong>#{o.id} {o.username}</strong> <span style={{color:'#0071e3'}}>¥{o.totalPrice}</span>
            <div style={{fontSize:'12px', color:'#888'}}>IP: {o.ipAddress} | ID: {o.browserId?.substring(0,8)}</div>
            <div style={{background:'#f0f0f0', padding:'10px', marginTop:'10px'}}>
              <code>Code: {o.transferCode} / Pass: {o.authPassword}</code>
            </div>
            <a href={o.paypayUrl} target="_blank" style={{display:'inline-block', marginTop:'10px'}}>PayPayリンク</a>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{background:'#fff', color:'#333', minHeight:'100vh', fontFamily:'"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", sans-serif'}}>
      {/* Header */}
      <header style={{padding:'20px', textAlign:'center', borderBottom:'1px solid #eee'}}>
        <h1 style={{fontSize:'24px', fontWeight:'bold', letterSpacing:'2px'}}>WEI 代行 STORE</h1>
        <p style={{fontSize:'10px', color:'#999'}}>MADE IN JAPAN QUALITY</p>
      </header>

      <main style={{maxWidth:'800px', margin:'0 auto', padding:'20px'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'15px', marginBottom:'40px'}}>
          {PRODUCTS.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelected(prev => prev.includes(p.id) ? prev.filter(x => x!==p.id) : [...prev, p.id])}
              style={{
                padding:'20px', borderRadius:'15px', border: selected.includes(p.id) ? '2px solid #0071e3' : '1px solid #eee',
                textAlign:'center', cursor:'pointer', position:'relative', transition:'0.2s',
                background: selected.includes(p.id) ? '#f0f7ff' : '#fff'
              }}
            >
              <span style={{fontSize:'10px', background:'#0071e3', color:'#fff', padding:'2px 8px', borderRadius:'10px', position:'absolute', top:'-8px', left:'50%', transform:'translateX(-50%)'}}>{p.tag}</span>
              <div style={{fontSize:'16px', fontWeight:'bold', marginTop:'5px'}}>{p.name}</div>
              <div style={{fontSize:'18px', color:'#0071e3', fontWeight:'bold', marginTop:'10px'}}>¥{p.price}</div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <form onSubmit={handleOrder} style={{background:'#f9f9fb', padding:'30px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.05)'}}>
            <h3 style={{textAlign:'center', marginBottom:'20px'}}>お客様情報の入力</h3>
            <input name="un" placeholder="お名前 (Discord表示名など)" style={inS} required />
            <input name="tc" placeholder="引き継ぎコード" style={inS} required />
            <input name="ap" placeholder="認証番号" style={inS} required />
            <textarea name="p" placeholder="PayPay受取リンクを貼り付けてください" style={{...inS, height:'80px'}} required />
            
            <div style={{textAlign:'center', padding:'20px'}}>
               <p style={{fontSize:'14px', color:'#666'}}>お支払い合計</p>
               <p style={{fontSize:'32px', fontWeight:'bold', color:'#333'}}>¥{selected.reduce((s, id) => s + (PRODUCTS.find(p => p.id === id)?.price || 0), 0)}</p>
            </div>

            <button type="submit" style={{width:'100%', background:'#1d1d1f', color:'#fff', border:'none', padding:'18px', borderRadius:'12px', fontSize:'18px', fontWeight:'bold', cursor:'pointer'}}>注文を確定する</button>
          </form>
        )}
      </main>
    </div>
  );
}

const inS = { width:'100%', padding:'15px', marginBottom:'10px', borderRadius:'10px', border:'1px solid #ddd', fontSize:'16px', boxSizing:'border-box' as 'border-box' };
