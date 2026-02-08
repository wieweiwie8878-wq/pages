import React, { useState, useEffect } from 'react';

const API_BASE = "https://apiindex.nasserl.workers.dev"; // あなたのWorkers

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const hostname = window.location.hostname;

  // --- 管理者モードかどうかの判定 ---
  const isAdminDomain = hostname.startsWith('admin.');

  const refresh = async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: { 'Authorization': password } });
    const json = await res.json();
    if (json.orders) setData(json);
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth`, { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { setIsLoggedIn(true); localStorage.setItem('admin_pw', password); } else { alert("認証失敗"); }
  };

  useEffect(() => { if (isAdminDomain && password) login(); }, []);
  useEffect(() => { if (isAdminDomain && isLoggedIn) refresh(); }, [isLoggedIn]);

  // --- A. 管理者用画面 (admin.kenji123.f5.si) ---
  if (isAdminDomain) {
    if (!isLoggedIn) return (
      <div style={{background:'#000', color:'#fff', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        <h1>Wei代行 管理ログイン</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{padding:'10px', margin:'10px', textAlign:'center'}} placeholder="Password" />
        <button onClick={login} style={{background:'#4af', color:'#fff', padding:'10px 20px', borderRadius:'5px'}}>ログイン</button>
      </div>
    );

    return (
      <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
        <h2>魏司令官：代行管理センター</h2>
        <div style={{display:'grid', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#222', padding:'15px', borderRadius:'10px', border:'1px solid #333'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <strong>#{o.id} {o.username} (¥{o.totalPrice})</strong>
                <span style={{color: o.status==='completed'?'#4f4':'#ff4'}}>{o.status}</span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px', margin:'10px 0'}}>
                <code style={{background:'#000', color:'#fa0', padding:'5px'}}>ID: {o.transferCode}</code>
                <code style={{background:'#000', color:'#fa0', padding:'5px'}}>PW: {o.authPassword}</code>
              </div>
              <p style={{fontSize:'12px'}}>内容: {o.services.join(',')}</p>
              <div style={{display:'flex', gap:'5px'}}>
                <button onClick={() => {/* API経由で完了処理 */}} style={{background:'#28a745', color:'#fff'}}>一発完了通知</button>
                <a href={o.paypayUrl} target="_blank" style={{background:'#fff', color:'#000', padding:'5px 10px', borderRadius:'5px', textDecoration:'none', fontWeight:'bold'}}>PayPay受取</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- B. お客さん用画面 (kenji123.f5.si) ---
  return (
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:'40px', color:'#4af', marginBottom:'10px'}}>Wei代行サービス</h1>
      <p style={{fontSize:'18px', color:'#aaa'}}>業界最速・最安のにゃんこ大戦争育成サポート</p>
      
      <div style={{background:'#222', padding:'30px', borderRadius:'20px', border:'1px solid #333', marginTop:'20px', maxWidth:'500px'}}>
        <h3>💰 人気メニュー</h3>
        <ul style={{listStyle:'none', padding:0, textAlign:'left'}}>
          <li>🔹 猫缶・XPカンスト ➔ 80円</li>
          <li>🔹 全キャラ解放 ➔ 150円</li>
          <li>🔹 初期垢最強セット ➔ 500円</li>
        </ul>
        <div style={{marginTop:'30px'}}>
          <a href="魏さんのDiscord招待リンク" style={{background:'#5865F2', color:'#fff', padding:'15px 30px', borderRadius:'10px', textDecoration:'none', fontWeight:'bold', fontSize:'20px'}}>Discordで注文する</a>
        </div>
      </div>
      <p style={{marginTop:'20px', color:'#555'}}>© 2026 Wei Systems</p>
    </div>
  );
}
