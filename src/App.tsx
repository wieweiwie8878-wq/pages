import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";

// 全メニュー定義
const DAIKO_ITEMS = [
  { id: 'neko', name: '猫缶カンスト', price: 80 }, { id: 'xp', name: 'XPカンスト', price: 80 },
  { id: 't_norm', name: '通常チケ指定', price: 80 }, { id: 't_rare', name: 'レアチケ指定', price: 80 },
  { id: 'st_one', name: '1ステ開放', price: 80 }, { id: 'all_c', name: '全キャラ解放', price: 150 },
  { id: 'err_del', name: 'エラーキャラ削除', price: 200 }, { id: 'np', name: 'NP変更', price: 100 },
  { id: 'item', name: 'アイテム変更', price: 100 }, { id: 'eye', name: 'キャッツアイ変更', price: 100 },
  { id: 'bitan', name: 'ネコビタン変更', price: 100 }, { id: 'castle', name: '城の素材変更', price: 100 },
  { id: 'mata', name: 'マタタビ変更', price: 100 }, { id: 'leader', name: 'リーダーシップ', price: 100 },
  { id: 'ptime', name: 'プレイ時間', price: 100 }, { id: 'clv', name: '城のレベル', price: 100 },
  { id: 'g_char', name: 'グループ別キャラ解放', price: 100 }, { id: 'st_ch', name: 'ステージ開放(章ごと)', price: 100 },
  { id: 'legend', name: 'レジェステ解放', price: 100 }, { id: 'treasure', name: 'お宝解放(章ごと)', price: 100 },
  { id: 'ban', name: '🛡️ BAN保証オプション', price: 500 }
];
const ACC_ITEMS = [
  { id: 'acc_basic', name: '【基本セット】猫缶+XP', price: 400 },
  { id: 'acc_strong', name: '【最強セット】猫缶+XP+全キャラ', price: 500 }
];

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const toggleItem = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const calculateTotal = () => {
    const all = [...DAIKO_ITEMS, ...ACC_ITEMS];
    return selected.reduce((s, id) => s + (all.find(p => p.id === id)?.price || 0), 0);
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const all = [...DAIKO_ITEMS, ...ACC_ITEMS];
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: all.filter(p => selected.includes(p.id)).map(p => p.name).join(', '),
      total: calculateTotal(),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文完了！"); window.location.reload(); }
  };

  if (isAdmin) {
    // 管理画面ロジック(以前のものを流用)
    return <div style={{background:'#000', color:'#fff', padding:'20px'}}>魏司令官専用 Admin Panel</div>;
  }

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI 代行 & アカウント STORE</header>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>
        
        {view === 'main' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div onClick={() => setView('daiko')} style={cardS}>🐾 にゃんこ大戦争 代行メニュー</div>
            <div onClick={() => setView('account')} style={cardS}>🎁 アカウント販売 (初期垢)</div>
          </div>
        )}

        {(view === 'daiko' || view === 'account') && (
          <div>
            <button onClick={() => setView('main')} style={backS}>← カテゴリ選択へ戻る</button>
            <div style={gridS}>
              {(view === 'daiko' ? DAIKO_ITEMS : ACC_ITEMS).map(p => (
                <div key={p.id} onClick={() => toggleItem(p.id)} style={selected.includes(p.id) ? selectedS : itemS}>
                  <div style={{fontWeight:'bold'}}>{p.name}</div>
                  <div>¥{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected.length > 0 && (
          <form onSubmit={handleOrder} style={formS}>
            <h3 style={{textAlign:'center'}}>注文手続き</h3>
            <input name="un" placeholder="お名前 (Discordなど)" style={inputS} required />
            <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
            <input name="ap" placeholder="認証番号" style={inputS} required />
            <textarea name="p" placeholder="PayPayリンク" style={{...inputS, height:'60px'}} required />
            <div style={{textAlign:'center', fontSize:'24px', fontWeight:'bold', margin:'20px 0'}}>合計: ¥{calculateTotal()}</div>
            <button type="submit" style={btnS}>注文を確定する</button>
          </form>
        )}
      </main>
    </div>
  );
}

const headerS: any = { padding:'20px', textAlign:'center', fontSize:'20px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const cardS: any = { background:'#fff', padding:'40px', borderRadius:'20px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', fontSize:'18px', fontWeight:'bold' };
const gridS: any = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' };
const itemS: any = { background:'#fff', padding:'15px', borderRadius:'12px', border:'1px solid #d2d2d7', cursor:'pointer', textAlign:'center' };
const selectedS: any = { ...itemS, border:'2px solid #0071e3', background:'#f0f7ff' };
const backS: any = { background:'none', border:'none', color:'#0071e3', cursor:'pointer', marginBottom:'20px' };
const formS: any = { marginTop:'40px', background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'12px', borderRadius:'8px', border:'1px solid #ddd', width:'100%', boxSizing:'border-box', marginBottom:'10px' };
const btnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontWeight:'bold', cursor:'pointer' };
