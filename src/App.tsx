import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";
// 商品全21項目 + 垢販売を網羅
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
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = async () => {
    if (!password) return;
    const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } });
    const json = await res.json();
    if (json.orders) setData(json);
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/api/auth`, { method: 'POST', body: JSON.stringify({ password }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { setIsLoggedIn(true); localStorage.setItem('admin_pw', password); refresh(); } else { alert("パスワード不一致"); }
  };

  useEffect(() => {
    if (isAdmin && password && !isLoggedIn) { login(); }
    else if (isAdmin && isLoggedIn) { refresh(); }
  }, [isAdmin, isLoggedIn]);

  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={centerS}><h1 style={{color:'#4af'}}>WEI ADMIN</h1><input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inputS}/><button onClick={login} style={btnS}>LOGIN</button></div>
    );
    return (
      <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #4af', marginBottom:'20px'}}><h2>魏 司令官</h2><button onClick={refresh}>更新</button></div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#111', border:'1px solid #333', padding:'15px', borderRadius:'10px'}}>
              <strong>#{o.id} {o.username} <span style={{color:'#4af'}}>¥{o.totalPrice}</span></strong>
              <div style={{fontSize:'12px', color:'#aaa', marginTop:'5px'}}>{o.services}</div>
              <div style={{background:'#222', padding:'10px', marginTop:'10px', borderRadius:'5px'}}><code>{o.transferCode} / {o.authPassword}</code></div>
              <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>{
                    const fd = new FormData(); fd.append('id', o.id); fd.append('action', 'complete'); fd.append('image', e.target.files![0]); fd.append('userId', o.userId);
                    fetch(`${API_BASE}/api/admin/action`, {method:'POST', body:fd, headers:{'Authorization':password}}).then(refresh);
                }} />
                <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#28a745', color:'#fff', border:'none', borderRadius:'5px'}}>完了</button>
                <a href={o.paypayUrl} target="_blank" style={{flex:1, background:'#fff', color:'#000', textDecoration:'none', textAlign:'center', borderRadius:'5px', padding:'10px'}}>PayPay</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI STORE</header>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {view === 'main' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop:'20px' }}>
            <div onClick={() => setView('daiko')} style={mainCardS}>🐾 代行</div>
            <div onClick={() => setView('account')} style={mainCardS}>🎁 垢販売</div>
          </div>
        ) : (
          <div>
            <button onClick={() => {setView('main'); setSelected([]);}} style={backS}>← 戻る</button>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {(view === 'daiko' ? DAIKO_LIST : ACC_LIST).map(p => (
                <div key={p.id} onClick={() => setSelected(prev => prev.includes(p.id)?prev.filter(x=>x!==p.id):[...prev, p.id])} style={selected.includes(p.id)?selectedS:itemS}>
                  <div>{p.name}</div><div style={{color:'#0071e3'}}>¥{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selected.length > 0 && (
          <form onSubmit={async (e:any)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            const all = [...DAIKO_LIST, ...ACC_LIST];
            const order = { username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'), services: all.filter(p=>selected.includes(p.id)).map(p=>p.name).join(','), total: all.filter(p=>selected.includes(p.id)).reduce((s,p)=>s+p.price,0), browserId: localStorage.getItem('wei_id') || Math.random().toString(36)};
            await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
            alert("注文完了！"); window.location.reload();
          }} style={formS}>
            <input name="un" placeholder="名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}><input name="tc" placeholder="コード" style={inputS} required /><input name="ap" placeholder="パス" style={inputS} required /></div>
            <textarea name="p" placeholder="PayPay受取リンク" style={{...inputS, height:'80px'}} required />
            <button type="submit" style={submitBtnS}>¥{selected.reduce((s,id) => s + ([...DAIKO_LIST, ...ACC_LIST].find(p=>p.id===id)?.price || 0), 0)} で注文確定</button>
          </form>
        )}
      </main>
    </div>
  );
}

const headerS: any = { padding:'15px', textAlign:'center', fontSize:'18px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const mainCardS: any = { background:'#fff', padding:'50px 20px', borderRadius:'20px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', fontSize:'18px', fontWeight:'bold' };
const itemS: any = { background:'#fff', padding:'15px 10px', borderRadius:'12px', border:'1px solid #d2d2d7', cursor:'pointer', textAlign:'center', fontSize:'13px' };
const selectedS: any = { ...itemS, border:'2px solid #0071e3', background:'#f0f7ff' };
const formS: any = { marginTop:'40px', background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'12px', borderRadius:'10px', border:'1px solid #ddd', width:'100%', boxSizing:'border-box', marginBottom:'10px' };
const submitBtnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'bold', cursor:'pointer' };
const backS: any = { border:'none', background:'none', color:'#0071e3', cursor:'pointer', marginBottom:'20px' };
const copyS: any = { flex:1, background:'#222', color:'#fa0', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer' };
const centerS: any = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000' };
const btnS: any = { background:'#4af', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'5px', cursor:'pointer' };
