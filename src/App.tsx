import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkers
const ADMIN_PW = "yudai2011";

// --- 全商品データベース ---
const DAIKO_ITEMS = {
  "80円均一": [
    { id: 'neko', name: '猫缶カンスト', price: 80 }, { id: 'xp', name: 'XPカンスト', price: 80 },
    { id: 't_n', name: '通常チケ指定', price: 80 }, { id: 't_r', name: 'レアチケ指定', price: 80 },
    { id: 'st1', name: '1ステ解放', price: 80 }
  ],
  "100円均一": [
    { id: 'np', name: 'NP変更', price: 100 }, { id: 'item', name: 'アイテム変更', price: 100 },
    { id: 'eye', name: 'キャッツアイ', price: 100 }, { id: 'bitan', name: 'ネコビタン', price: 100 },
    { id: 'castle', name: '城素材変更', price: 100 }, { id: 'mata', name: 'マタタビ変更', price: 100 },
    { id: 'leader', name: 'リーダーシップ', price: 100 }, { id: 'ptime', name: 'プレイ時間', price: 100 },
    { id: 'clv', name: '城レベル', price: 100 }, { id: 'g_ch', name: 'グループキャラ', price: 100 },
    { id: 'st_ch', name: '章ごと解放', price: 100 }, { id: 'leg', name: 'レジェステ解放', price: 100 },
    { id: 'tre', name: 'お宝解放', price: 100 }
  ],
  "特別": [
    { id: 'all_c', name: '全キャラ解放', price: 150 }, { id: 'err', name: 'エラーキャラ削除', price: 200 },
    { id: 'ban_g', name: '🛡️ BAN保証', price: 500 }
  ]
};
const ACC_ITEMS = [
  { id: 'acc_b', name: '【基本セット】猫缶+XP', price: 400 },
  { id: 'acc_s', name: '【最強セット】猫缶+XP+全キャラ', price: 500 }
];

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const [paypayOk, setPaypayOk] = useState(false);

  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);
  const copy = (t: string) => { navigator.clipboard.writeText(t); alert("コピーしました"); };
  const adminAction = (id: any, action: string, extra = {}) => {
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(refresh);
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const all = [...Object.values(DAIKO_ITEMS).flat(), ...ACC_ITEMS];
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: all.filter(p => selected.includes(p.id)).map(p => p.name).join(','),
      total: all.filter(p => selected.includes(p.id)).reduce((s,p)=>s+p.price, 0),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("ご注文ありがとうございます！"); window.location.reload(); }
  };

  useEffect(() => { if (isAdmin && password) refresh(); }, []);

  // --- A. 管理画面 (admin.kenji123.f5.si) ---
  if (isAdmin) {
    if (!isLoggedIn && !data) return (
      <div style={centerS}>
        <h1 style={{color:'#4af', letterSpacing:'5px'}}>WEI OS v2.0</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputS} placeholder="Admin Token" />
        <button onClick={() => { setIsLoggedIn(true); refresh(); localStorage.setItem('admin_pw', password); }} style={btnS}>ACCESS</button>
      </div>
    );
    return (
      <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #4af', paddingBottom:'10px', marginBottom:'20px'}}>
          <h2>魏 司令官：管理パネル</h2>
          <button onClick={refresh} style={btnSmallS}>RELOAD</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(400px, 1fr))', gap:'20px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#111', border:'1px solid #333', padding:'20px', borderRadius:'15px', position:'relative'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <span style={{color: o.status==='working'?'#0af':'#fa0', fontWeight:'bold'}}>#{o.id} {o.username}</span>
                <span style={{fontSize:'20px', fontWeight:'bold'}}>¥{o.totalPrice}</span>
              </div>
              <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                <button onClick={()=>copy(o.transferCode)} style={copyS}>ID: {o.transferCode}</button>
                <button onClick={()=>copy(o.authPassword)} style={copyS}>PW: {o.authPassword}</button>
              </div>
              <div style={{fontSize:'12px', color:'#aaa', background:'#000', padding:'10px', borderRadius:'5px'}}>{o.services}</div>
              <div style={{display:'flex', gap:'5px', marginTop:'15px'}}>
                <button onClick={()=>adminAction(o.id, 'working')} style={{flex:1, background:'#0071e3', color:'#fff', border:'none', borderRadius:'5px', cursor:'pointer'}}>進行中</button>
                <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>adminAction(o.id, 'complete', {image: e.target.files![0], userId: o.userId, username: o.username})} />
                <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#28a745', color:'#fff', border:'none', borderRadius:'5px', cursor:'pointer'}}>完了通知</button>
                <button onClick={()=>adminAction(o.id, 'delete')} style={{background:'#444', color:'#fff', border:'none', borderRadius:'5px', padding:'0 10px'}}>消去</button>
              </div>
              <a href={o.paypayUrl} target="_blank" style={{display:'block', textAlign:'center', marginTop:'10px', color:'#4af', fontSize:'12px'}}>PayPayリンクを開く</a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- B. ユーザー画面 (kenji123.f5.si) ---
  return (
    <div style={{ background: '#f5f5f7', color: '#1d1d1f', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI STORE</header>
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
        
        {view === 'main' ? (
          <div style={{ display: 'grid', gridTemplateColumns:'1fr 1fr', gap: '15px', marginTop:'40px' }}>
            <div onClick={() => setView('daiko')} style={mainCardS}><span style={{fontSize:'40px'}}>🐾</span><br/>代行依頼</div>
            <div onClick={() => setView('account')} style={mainCardS}><span style={{fontSize:'40px'}}>🎁</span><br/>垢販売</div>
          </div>
        ) : (
          <div>
            <button onClick={() => {setView('main'); setSelected([]);}} style={backS}>← 戻る</button>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              {view === 'daiko' ? (
                Object.entries(DAIKO_ITEMS).flatMap(([group, items]: any) => items.map((p: any) => (
                  <div key={p.id} onClick={() => toggleItem(p.id)} style={selected.includes(p.id)?selectedS:itemS}>
                    <div style={{fontSize:'13px', fontWeight:'bold'}}>{p.name}</div>
                    <div style={{fontSize:'12px', color:'#0071e3'}}>¥{p.price}</div>
                  </div>
                )))
              ) : (
                ACC_ITEMS.map(p => (
                  <div key={p.id} onClick={() => toggleItem(p.id)} style={selected.includes(p.id)?selectedS:itemS}>
                    <div style={{fontSize:'14px', fontWeight:'bold'}}>{p.name}</div>
                    <div style={{fontSize:'16px', color:'#0071e3'}}>¥{p.price}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selected.length > 0 && (
          <form onSubmit={handleOrder} style={formS}>
            <h2 style={{textAlign:'center', marginBottom:'20px'}}>注文手続き</h2>
            <input name="un" placeholder="お名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
              <input name="ap" placeholder="認証番号" style={inputS} required />
            </div>
            <textarea name="p" onChange={e=>setPaypayOk(e.target.value.includes("paypay.ne.jp"))} placeholder="PayPayリンクを貼り付け" style={{...inputS, height:'80px'}} required />
            <div style={{textAlign:'center', padding:'20px', fontSize:'24px', fontWeight:'bold'}}>合計: ¥{selected.reduce((s,id) => s + ([...Object.values(DAIKO_ITEMS).flat(), ...ACC_ITEMS].find(p=>p.id===id)?.price || 0), 0)}</div>
            <button type="submit" style={submitBtnS}>注文を確定して送信</button>
          </form>
        )}
      </main>
    </div>
  );
}

const headerS: any = { padding:'20px', textAlign:'center', fontSize:'22px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const mainCardS: any = { background:'#fff', padding:'40px 20px', borderRadius:'24px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', transition:'0.3s' };
const itemS: any = { background:'#fff', padding:'20px 10px', borderRadius:'15px', border:'1px solid #d2d2d7', cursor:'pointer', textAlign:'center' };
const selectedS: any = { ...itemS, border:'2px solid #0071e3', background:'#f0f7ff' };
const formS: any = { marginTop:'40px', background:'#fff', padding:'30px', borderRadius:'30px', boxShadow:'0 20px 40px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'15px', borderRadius:'12px', border:'1px solid #d2d2d7', width:'100%', boxSizing:'border-box', marginBottom:'10px', fontSize:'16px' };
const submitBtnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'20px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' };
const copyS: any = { flex:1, background:'#000', color:'#fa0', border:'1px solid #333', padding:'10px', borderRadius:'5px', cursor:'pointer', fontSize:'13px' };
const backS: any = { border:'none', background:'none', color:'#0071e3', fontSize:'16px', cursor:'pointer', marginBottom:'20px' };
const centerS: any = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000' };
const btnS: any = { background:'#4af', color:'#fff', border:'none', padding:'12px 40px', borderRadius:'10px', cursor:'pointer', fontWeight:'bold' };
const btnSmallS: any = { background:'#333', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer' };
