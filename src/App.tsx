import React, { useState, useEffect } from 'react';

const API_BASE = ""; // Functionsと同じドメインで動くため空でOK
const STATUS_LABELS: any = {
  pending: { label: '⏳ 未着手', color: '#ffcc00' },
  working: { label: '🛠 進行中', color: '#00ccff' },
  completed: { label: '✅ 完了', color: '#00ff66' }
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  // --- 共通API通信関数 ---
  const apiFetch = async (path: string, method = 'GET', body?: any) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(path, {
      method,
      headers: { 
        'Authorization': password,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' })
      },
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined)
    });
    if (res.status === 401) { setIsLoggedIn(false); return null; }
    return res.json();
  };

  const login = async () => {
    const res = await fetch('/api/auth', { 
      method: 'POST', 
      body: JSON.stringify({ password }), 
      headers: { 'Content-Type': 'application/json' } 
    });
    if (res.ok) { 
      setIsLoggedIn(true); 
      localStorage.setItem('admin_pw', password); 
      refresh(); 
    } else { alert("パスワードが違います"); }
  };

  const refresh = () => { if (isLoggedIn) apiFetch('/api/admin/stats').then(setData); };

  // --- スクショ送信 ＆ 完了通知 ---
  const handleComplete = async (orderId: number, userId: string) => {
    const fileInput = document.getElementById(`file-${orderId}`) as HTMLInputElement;
    if (!fileInput.files?.[0]) return alert("完了スクショを選択してください");

    const formData = new FormData();
    formData.append('id', orderId.toString());
    formData.append('userId', userId);
    formData.append('image', fileInput.files[0]); // ここで画像をWorkersへ飛ばす

    const res = await apiFetch('/api/admin/complete', 'POST', formData);
    if (res?.success) {
      alert("✅ 客に画像を送信し、完了通知を行いました！");
      refresh();
    }
  };

  const scrub = (id: number) => {
    if (confirm("引き継ぎ情報をDBから消去しますか？")) {
      apiFetch('/api/admin/scrub', 'POST', { id }).then(refresh);
    }
  };

  useEffect(() => { if (isAdmin && password && !isLoggedIn) login(); }, []);
  useEffect(() => { if (isLoggedIn) refresh(); }, [isLoggedIn]);

  // --- A. 管理画面 (admin.kenji123.f5.si) ---
  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={{background:'#000', color:'#fff', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
        <h1 style={{color:'#4af'}}>Wei Admin Center</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{padding:'12px', borderRadius:'8px', border:'1px solid #333', background:'#111', color:'#fff', textAlign:'center', fontSize:'18px'}} placeholder="Password" />
        <button onClick={login} style={{background:'#4af', color:'#fff', border:'none', padding:'12px 40px', borderRadius:'8px', marginTop:'15px', cursor:'pointer', fontWeight:'bold'}}>LOGIN</button>
      </div>
    );

    return (
      <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:'15px', fontFamily:'sans-serif'}}>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#222', padding:'20px', borderRadius:'15px', border:'1px solid #333', marginBottom:'20px'}}>
            <h2 style={{margin:0, color:'#4af'}}>魏司令官：代行管理パネル</h2>
            <button onClick={refresh} style={{background:'#333', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'8px', cursor:'pointer'}}>↻ 更新</button>
          </div>

          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#222', borderRadius:'15px', padding:'20px', marginBottom:'15px', border:'1px solid #333'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
                <span style={{fontWeight:'bold', fontSize:'18px'}}>#{o.id} {o.username}</span>
                <span style={{color: STATUS_LABELS[o.status]?.color || '#fff', fontWeight:'bold'}}>{STATUS_LABELS[o.status]?.label || o.status}</span>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                <div style={{background:'#000', padding:'10px', borderRadius:'10px', border:'1px solid #333'}}>
                  <div style={{fontSize:'10px', color:'#888'}}>🗝️ 引き継ぎコード</div>
                  <div style={{fontFamily:'monospace', color:'#fa0', fontSize:'16px', wordBreak:'break-all'}}>{o.transferCode}</div>
                </div>
                <div style={{background:'#000', padding:'10px', borderRadius:'10px', border:'1px solid #333'}}>
                  <div style={{fontSize:'10px', color:'#888'}}>🔐 認証番号</div>
                  <div style={{fontFamily:'monospace', color:'#fa0', fontSize:'16px'}}>{o.authPassword}</div>
                </div>
              </div>

              <div style={{fontSize:'13px', color:'#ccc', background:'#1a1a1a', padding:'12px', borderRadius:'8px', marginBottom:'15px', border:'1px solid #333'}}>
                内容: {o.services} <br/> 詳細: {o.details} <br/> 金額: ¥{o.totalPrice}
              </div>

              <div style={{display:'flex', gap:'8px', flexDirection:'column'}}>
                <div style={{display:'flex', gap:'8px', background:'#333', padding:'10px', borderRadius:'10px'}}>
                   <input type="file" id={`file-${o.id}`} accept="image/*" style={{fontSize:'12px', flex:1}} />
                   <button onClick={() => handleComplete(o.id, o.userId)} style={{background:'#009944', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>
                     画像送信 ＆ 完了
                   </button>
                </div>
                <div style={{display:'flex', gap:'8px'}}>
                  <button onClick={() => scrub(o.id)} style={{flex:1, background:'#cc3300', color:'#fff', border:'none', padding:'10px', borderRadius:'8px', cursor:'pointer'}}>個人情報抹消</button>
                  <a href={o.paypayUrl} target="_blank" rel="noreferrer" style={{flex:1, background:'#fff', color:'#000', textDecoration:'none', textAlign:'center', padding:'10px', borderRadius:'8px', fontWeight:'bold'}}>PayPay</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- B. 一般案内画面 (kenji123.f5.si) ---
  return (
    <div style={{background:'#111', color:'#fff', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', fontFamily:'sans-serif', padding:'20px'}}>
      <h1 style={{fontSize:'45px', color:'#4af', marginBottom:'10px', fontWeight:'900'}}>Wei 代行</h1>
      <p style={{fontSize:'20px', color:'#aaa', marginBottom:'40px'}}>業界最速10秒納品・業界最安値のにゃんこ大戦争育成サポート</p>
      
      <div style={{background:'#222', padding:'40px', borderRadius:'30px', border:'1px solid #333', width:'100%', maxWidth:'500px', boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
        <h2 style={{marginBottom:'20px'}}>💰 MENU</h2>
        <div style={{textAlign:'left', display:'inline-block'}}>
          <p>✅ 猫缶・XPカンスト ➔ **¥80**</p>
          <p>✅ 全キャラ解放 ➔ **¥150**</p>
          <p>✅ 最強初期垢セット ➔ **¥500**</p>
        </div>
        <div style={{marginTop:'40px'}}>
          <a href="魏さんのDiscord招待リンク" style={{background:'#5865F2', color:'#fff', padding:'15px 40px', borderRadius:'15px', textDecoration:'none', fontWeight:'bold', fontSize:'24px', display:'block'}}>注文はDiscordへ</a>
        </div>
      </div>
      <p style={{marginTop:'30px', color:'#444', fontSize:'12px'}}>© 2026 Wei Systems Team.</p>
    </div>
  );
}
