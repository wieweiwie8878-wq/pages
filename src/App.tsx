import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkersのURL
const SERVICES: any = {
  "neko": { name: "猫缶カンスト", price: 80 }, "xp": { name: "XPカンスト", price: 80 },
  "all_c": { name: "全キャラ解放", price: 150 }, "ban": { name: "🛡️ BAN保証", price: 500 }
};

// ブラウザ識別IDの取得・生成
const getBrowserId = () => {
  let id = localStorage.getItem('wei_browser_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('wei_browser_id', id);
  }
  return id;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);

  const login = async () => {
    const res = await fetch(`${API_BASE}/api/auth`, { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { setIsLoggedIn(true); localStorage.setItem('admin_pw', password); refresh(); } else { alert("認証失敗"); }
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    if (selected.length === 0) return alert("メニューを選んでください");
    const fd = new FormData(e.target);
    const order = {
      username: fd.get('un'),
      userId: fd.get('uid'),
      tc: fd.get('tc'),
      ap: fd.get('ap'),
      paypayUrl: fd.get('p'),
      services: selected.map(k => SERVICES[k].name).join(', '),
      total: selected.reduce((s, k) => s + SERVICES[k].price, 0),
      browserId: getBrowserId() // ブラウザIDを送信
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文完了！Discordをご確認ください。"); window.location.reload(); }
  };

  const complete = async (id: number, uid: string) => {
    const f = document.getElementById(`f-${id}`) as HTMLInputElement;
    if (!f.files?.[0]) return alert("画像を選んでください");
    const fd = new FormData(); fd.append('id', id.toString()); fd.append('userId', uid); fd.append('image', f.files[0]);
    await fetch(`${API_BASE}/api/admin/complete`, { method: 'POST', body: fd, headers: { 'Authorization': password } });
    alert("完了！"); refresh();
  };

  const scrub = (id: number) => {
    if(confirm("消去しますか？")) fetch(`${API_BASE}/api/admin/scrub`, { method: 'POST', headers: { 'Authorization': password, 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then(refresh);
  };

  useEffect(() => { if (isAdmin && password && !isLoggedIn) login(); }, []);

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
        <h2>代行司令塔 (追跡機能ON)</h2>
        <div style={{display:'grid', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#222', padding:'15px', borderRadius:'10px', border:'1px solid #333'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <strong>#{o.id} {o.username} (¥{o.totalPrice})</strong>
                <div style={{fontSize:'10px', textAlign:'right', color:'#ff6666'}}>
                  IP: {o.ipAddress}<br/>ID: {o.browserId?.substring(0,8)}
                </div>
              </div>
              <div style={{margin:'10px 0'}}><code>ID: {o.transferCode} / PW: {o.authPassword}</code></div>
              <input type="file" id={`f-${o.id}`} accept="image/*" />
              <button onClick={() => complete(o.id, o.userId)} style={{background:'#28a745', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>画像送付 & 完了</button>
              <button onClick={() => scrub(o.id)} style={{background:'#444', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', marginLeft:'5px'}}>抹消</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:'sans-serif'}}>
      <h1 style={{color:'#4af', fontSize:'32px'}}>Wei 代行Web注文</h1>
      <form onSubmit={handleOrder} style={{background:'#222', padding:'25px', borderRadius:'15px', width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'10px'}}>
        <input name="un" placeholder="Discord名前 (必須)" style={inputStyle} required />
        <input name="uid" placeholder="Discord ID (数字)" style={inputStyle} required />
        <input name="tc" placeholder="引き継ぎコード" style={inputStyle} required />
        <input name="ap" placeholder="認証番号" style={inputStyle} required />
        <textarea name="p" placeholder="PayPayリンクを貼り付け" style={{...inputStyle, height:'60px'}} required />
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
          {Object.entries(SERVICES).map(([k, v]: any) => (
            <div key={k} onClick={() => setSelected(prev => prev.includes(k) ? prev.filter(x => x!==k) : [...prev, k])} style={{padding:'8px', background: selected.includes(k)?'#4af':'#333', color: selected.includes(k)?'#000':'#fff', borderRadius:'5px', cursor:'pointer', fontSize:'11px', textAlign:'center'}}>{v.name}</div>
          ))}
        </div>
        <button type="submit" style={{background:'#4af', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>注文を確定する</button>
      </form>
    </div>
  );
}

const inputStyle = { background: '#000', color: '#fff', border: '1px solid #444', padding: '10px', borderRadius: '5px' };
