import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";

// --- 全商品データベース ---
const CATEGORIES: any = {
  daiko: {
    name: "🐾 にゃんこ大戦争 代行メニュー",
    groups: [
      {
        title: "💰 80円均一メニュー",
        items: [
          { id: 'neko', name: '猫缶カンスト', price: 80 },
          { id: 'xp', name: 'XPカンスト', price: 80 },
          { id: 't_norm', name: '通常チケット枚数指定(1-100)', price: 80 },
          { id: 't_rare', name: 'レアチケット枚数指定(1-100)', price: 80 },
          { id: 'st_one', name: 'ステージ開放 (1ステージ)', price: 80 },
        ]
      },
      {
        title: "💰 100円均一メニュー",
        items: [
          { id: 'np', name: 'NP変更', price: 100 },
          { id: 'item', name: 'アイテム変更', price: 100 },
          { id: 'eye', name: 'キャッツアイ変更', price: 100 },
          { id: 'bitan', name: 'ネコビタン変更', price: 100 },
          { id: 'castle_m', name: '城の素材変更', price: 100 },
          { id: 'matatabi', name: 'マタタビ変更', price: 100 },
          { id: 'leader', name: 'リーダーシップ変更', price: 100 },
          { id: 'ptime', name: 'プレイ時間変更', price: 100 },
          { id: 'clv', name: '城のレベル変更', price: 100 },
          { id: 'g_char', name: 'グループ別キャラ解放', price: 100 },
          { id: 'st_ch', name: 'ステージ開放(章ごと)', price: 100 },
          { id: 'legend', name: 'レジェンドストーリー解放', price: 100 },
          { id: 'treasure', name: 'お宝解放(章ごと)', price: 100 },
        ]
      },
      {
        title: "✨ 特別・オプション",
        items: [
          { id: 'all_c', name: '全キャラ解放', price: 150 },
          { id: 'err_del', name: 'エラーキャラ削除', price: 200 },
          { id: 'ban', name: '🛡️ BAN保証オプション', price: 500 },
        ]
      }
    ]
  },
  account: {
    name: "🎁 初期アカウント販売",
    items: [
      { id: 'acc_basic', name: '【基本セット】猫缶+XPカンスト', price: 400 },
      { id: 'acc_strong', name: '【最強セット】猫缶+XP+全キャラ解放(えらキャラ有)', price: 500 },
    ]
  }
};

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>(["💰 80円均一メニュー"]);
  const [paypayStatus, setPaypayStatus] = useState<'none'|'valid'|'invalid'>('none');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);

  const isAdmin = window.location.hostname.startsWith('admin.');

  // --- 共通処理 ---
  const toggleItem = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleGroup = (t: string) => setOpenGroups(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const checkPayPay = (url: string) => setPaypayStatus(url.includes("https://pay.paypay.ne.jp/") ? 'valid' : 'invalid');

  const calculateTotal = () => {
    let total = 0;
    const allItems = [...CATEGORIES.account.items, ...CATEGORIES.daiko.groups.flatMap((g: any) => g.items)];
    selected.forEach(id => { total += allItems.find(p => p.id === id)?.price || 0; });
    return total;
  };

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const allItems = [...CATEGORIES.account.items, ...CATEGORIES.daiko.groups.flatMap((g: any) => g.items)];
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: allItems.filter(p => selected.includes(p.id)).map(p => p.name).join(', '),
      total: calculateTotal(),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文完了！管理者の連絡をお待ちください。"); window.location.reload(); }
  };

  useEffect(() => { if (isAdmin && password) refresh(); }, []);

  // --- A. 管理画面 ---
  if (isAdmin) {
    return (
      <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
        <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #333', paddingBottom:'10px'}}>
          <h1>Wei司令塔</h1><button onClick={refresh}>更新</button>
        </div>
        {data?.orders?.map((o: any) => (
          <div key={o.id} style={{background:'#111', border:'1px solid #333', margin:'10px 0', padding:'15px', borderRadius:'10px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><strong>#{o.id} {o.username}</strong><span>¥{o.totalPrice}</span></div>
            <div style={{fontSize:'12px', color:'#888'}}>IP: {o.ipAddress}</div>
            <div style={{background:'#222', padding:'10px', marginTop:'10px'}}><code>Code: {o.transferCode} / Pass: {o.authPassword}</code></div>
            <div style={{fontSize:'12px', marginTop:'10px'}}>内容: {o.services}</div>
            <a href={o.paypayUrl} target="_blank" style={{color:'#4af', display:'inline-block', marginTop:'10px'}}>PayPayリンクを開く</a>
          </div>
        ))}
      </div>
    );
  }

  // --- B. ユーザー画面 ---
  return (
    <div style={{ background: '#f5f5f7', color: '#1d1d1f', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI 代行 STORE</header>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 15px' }}>
        
        {view === 'main' ? (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div onClick={() => setView('daiko')} style={mainCardS}>🐾 代行を依頼する</div>
            <div onClick={() => setView('account')} style={mainCardS}>🎁 アカウントを買う</div>
          </div>
        ) : (
          <div>
            <button onClick={() => {setView('main'); setSelected([]);}} style={backS}>← 戻る</button>
            {view === 'daiko' ? (
              CATEGORIES.daiko.groups.map((g: any) => (
                <div key={g.title} style={groupS}>
                  <div onClick={() => toggleGroup(g.title)} style={groupHeaderS}>
                    <span>{g.title}</span><span>{openGroups.includes(g.title)?'▲':'▼'}</span>
                  </div>
                  {openGroups.includes(g.title) && g.items.map((p: any) => (
                    <div key={p.id} onClick={() => toggleItem(p.id)} style={selected.includes(p.id)?selectedItemS:itemS}>
                      <span>{p.name}</span><strong>¥{p.price}</strong>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              CATEGORIES.account.items.map((p: any) => (
                <div key={p.id} onClick={() => toggleItem(p.id)} style={selected.includes(p.id)?selectedItemS:itemS}>
                   <span>{p.name}</span><strong>¥{p.price}</strong>
                </div>
              ))
            )}
          </div>
        )}

        {selected.length > 0 && (
          <form onSubmit={handleOrder} style={formS}>
            <h3 style={{textAlign:'center', marginBottom:'20px'}}>注文情報の入力</h3>
            <input name="un" placeholder="Discordお名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
              <input name="ap" placeholder="認証番号" style={inputS} required />
            </div>
            <div style={{position:'relative'}}>
              <textarea name="p" onChange={(e) => checkPayPay(e.target.value)} placeholder="PayPayリンク（定型文可）" style={{...inputS, height:'80px'}} required />
              {paypayStatus==='valid' && <small style={{color:'green'}}>✅ 有効なPayPay形式</small>}
              {paypayStatus==='invalid' && <small style={{color:'red'}}>❌ 正しいリンクを貼ってください</small>}
            </div>
            <div style={totalS}>合計: ¥{calculateTotal()}</div>
            <button type="submit" style={submitBtnS}>注文を確定する</button>
          </form>
        )}
      </main>
    </div>
  );
}

const headerS: any = { padding:'20px', textAlign:'center', fontSize:'22px', fontWeight:'700', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const mainCardS: any = { background:'#fff', padding:'40px 20px', borderRadius:'24px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', fontSize:'18px', fontWeight:'bold' };
const groupS: any = { background:'#fff', borderRadius:'15px', border:'1px solid #d2d2d7', marginBottom:'10px', overflow:'hidden' };
const groupHeaderS: any = { padding:'15px 20px', background:'#fafafa', cursor:'pointer', display:'flex', justifyContent:'space-between', fontWeight:'bold', borderBottom:'1px solid #eee' };
const itemS: any = { display:'flex', justifyContent:'space-between', padding:'15px 20px', cursor:'pointer', borderBottom:'1px solid #f5f5f7' };
const selectedItemS: any = { ...itemS, background:'#0071e3', color:'#fff' };
const backS: any = { border:'none', background:'none', color:'#0071e3', cursor:'pointer', marginBottom:'20px', fontSize:'16px' };
const formS: any = { marginTop:'30px', background:'#fff', padding:'25px', borderRadius:'25px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'12px', borderRadius:'10px', border:'1px solid #d2d2d7', width:'100%', boxSizing:'border-box', marginBottom:'10px', fontSize:'16px' };
const totalS: any = { textAlign:'center', padding:'20px', fontSize:'24px', fontWeight:'bold' };
const submitBtnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'20px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' };
