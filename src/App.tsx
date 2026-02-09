import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";
// --- 商品データ全21項目完全網羅 ---
const DAIKO_LIST = [
  { id: 'neko', name: '猫缶カンスト', price: 80 }, { id: 'xp', name: 'XPカンスト', price: 80 },
  { id: 't_n', name: '通常チケ指定', price: 80 }, { id: 't_r', name: 'レアチケ指定', price: 80 },
  { id: 'st_1', name: '1ステ解放', price: 80 }, { id: 'np', name: 'NP変更', price: 100 },
  { id: 'item', name: 'アイテム変更', price: 100 }, { id: 'eye', name: 'キャッツアイ', price: 100 },
  { id: 'bitan', name: 'ネコビタン', price: 100 }, { id: 'castle', name: '城素材変更', price: 100 },
  { id: 'mata', name: 'マタタビ変更', price: 100 }, { id: 'leader', name: 'リーダーシップ', price: 100 },
  { id: 'ptime', name: 'プレイ時間', price: 100 }, { id: 'clv', name: '城レベル', price: 100 },
  { id: 'g_ch', name: 'グループキャラ', price: 100 }, { id: 'st_ch', name: '章ごと解放', price: 100 },
  { id: 'leg', name: 'レジェステ解放', price: 100 }, { id: 'tre', name: 'お宝解放', price: 100 },
  { id: 'all_c', name: '全キャラ解放', price: 150 }, { id: 'err', name: 'エラーキャラ消去', price: 200 },
  { id: 'ban_g', name: '🛡️ BAN保証', price: 500 }
];
const ACC_LIST = [
  { id: 'acc_b', name: '基本初期垢', price: 400 }, { id: 'acc_s', name: '最強初期垢', price: 500 }
];

export default function App() {
  const [view, setView] = useState<'daiko' | 'account'>('daiko');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const [ppOk, setPpOk] = useState(false);

  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);
  const copy = (t: string) => { navigator.clipboard.writeText(t); alert("コピー完了"); };

  useEffect(() => { if (isAdmin && password) refresh(); }, []);

  // --- A. 管理画面デザイン ---
  if (isAdmin) {
    if (!isLoggedIn && !data) return (
      <div style={centerS}>
        <h1 style={{color:'#4af'}}>WEI ADMIN LOGIN</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputS} placeholder="Password" />
        <button onClick={() => { setIsLoggedIn(true); refresh(); localStorage.setItem('admin_pw', password); }} style={btnS}>LOGIN</button>
      </div>
    );
    return (
      <div style={{background:'#0a0a0a', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'2px solid #4af', paddingBottom:'10px', marginBottom:'20px'}}>
          <h2>魏司令官：管理画面</h2>
          <button onClick={refresh} style={btnSmallS}>RELOAD</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#111', border:'1px solid #333', padding:'15px', borderRadius:'10px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><strong>#{o.id} {o.username}</strong><span style={{color:'#0f0'}}>¥{o.totalPrice}</span></div>
              <div style={{fontSize:'11px', color:'#666'}}>IP: {o.ipAddress}</div>
              <div style={{display:'flex', gap:'5px', margin:'10px 0'}}>
                <button onClick={()=>copy(o.transferCode)} style={copyS}>ID: {o.transferCode}</button>
                <button onClick={()=>copy(o.authPassword)} style={copyS}>PW: {o.authPassword}</button>
              </div>
              <div style={{fontSize:'12px', color:'#aaa'}}>{o.services}</div>
              <a href={o.paypayUrl} target="_blank" style={{color:'#4af', display:'block', marginTop:'10px'}}>PayPayリンクを開く</a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- B. ユーザー画面 (2列グリッドで見やすく) ---
  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const orderItems = [...DAIKO_LIST, ...ACC_LIST].filter(p => selected.includes(p.id));
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: orderItems.map(p => p.name).join(', '),
      total: orderItems.reduce((s, p) => s + p.price, 0),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文完了しました！"); window.location.reload(); }
  };

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI STORE</header>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div style={tabBoxS}>
          <button onClick={() => setView('daiko')} style={view==='daiko'?tabAS:tabS}>代行依頼</button>
          <button onClick={() => setView('account')} style={view==='account'?tabAS:tabS}>垢販売</button>
        </div>

        <div style={grid2S}>
          {(view === 'daiko' ? DAIKO_LIST : ACC_LIST).map(p => (
            <div key={p.id} onClick={() => setSelected(prev => prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev, p.id])} style={selected.includes(p.id)?selectedItemS:itemS}>
              <div style={{fontSize:'13px', fontWeight:'bold'}}>{p.name}</div>
              <div style={{fontSize:'14px', color:'#0071e3'}}>¥{p.price}</div>
            </div>
          ))}
        </div>

        {selected.length > 0 && (
          <form onSubmit={handleOrder} style={formS}>
            <input name="un" placeholder="お名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              <input name="tc" placeholder="コード" style={inputS} required />
              <input name="ap" placeholder="パス" style={inputS} required />
            </div>
            <textarea name="p" onChange={e=>setPpOk(e.target.value.includes("paypay.ne.jp"))} placeholder="PayPay受取リンクを貼り付け" style={{...inputS, height:'80px'}} required />
            {ppOk ? <small style={{color:'green'}}>✅ 有効なリンク形式です</small> : <small style={{color:'red'}}>❌ 正しいリンクを貼ってください</small>}
            <button type="submit" style={submitBtnS}>¥{[...DAIKO_LIST, ...ACC_LIST].filter(p=>selected.includes(p.id)).reduce((s,p)=>s+p.price,0)} で確定</button>
          </form>
        )}
      </main>
    </div>
  );
}

// スタイル
const headerS: any = { padding:'15px', textAlign:'center', fontSize:'18px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const grid2S: any = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' };
const itemS: any = { background:'#fff', padding:'15px 10px', borderRadius:'12px', border:'1px solid #d2d2d7', cursor:'pointer', textAlign:'center' };
const selectedItemS: any = { ...itemS, border:'2px solid #0071e3', background:'#f0f7ff' };
const inputS: any = { padding:'12px', borderRadius:'10px', border:'1px solid #d2d2d7', width:'100%', boxSizing:'border-box', marginBottom:'10px', fontSize:'16px' };
const submitBtnS: any = { width:'100%', background:'#1d1d1f', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'bold', cursor:'pointer', marginTop:'10px' };
const copyS: any = { flex:1, background:'#222', color:'#fa0', border:'1px solid #444', padding:'8px', borderRadius:'5px', fontSize:'12px', cursor:'pointer', overflow:'hidden' };
const tabBoxS: any = { display:'flex', gap:'5px', background:'#e5e5ea', padding:'4px', borderRadius:'10px', marginBottom:'15px' };
const tabS: any = { flex:1, padding:'8px', border:'none', background:'none', cursor:'pointer', borderRadius:'7px', color:'#888', fontSize:'14px' };
const tabAS: any = { ...tabS, background:'#fff', color:'#000', fontWeight:'bold' };
const centerS: any = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000' };
const btnS: any = { background:'#4af', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' };
const btnSmallS: any = { background:'#333', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer' };
