import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";

// 商品データ定義
const SERVICES_DAIKO = {
  "80円均一メニュー": [
    { id: 'neko', name: '猫缶カンスト', price: 80 },
    { id: 'xp', name: 'XPカンスト', price: 80 },
    { id: 't_norm', name: '通常チケ指定(1-100)', price: 80 },
    { id: 't_rare', name: 'レアチケ指定(1-100)', price: 80 },
    { id: 'st_one', name: 'ステージ開放(1ステ)', price: 80 },
  ],
  "100円均一メニュー": [
    { id: 'np', name: 'NP変更', price: 100 },
    { id: 'item', name: 'アイテム変更', price: 100 },
    { id: 'eye', name: 'キャッツアイ変更', price: 100 },
    { id: 'bitan', name: 'ネコビタン変更', price: 100 },
    { id: 'leader', name: 'リーダーシップ', price: 100 },
    { id: 'ptime', name: 'プレイ時間', price: 100 },
    { id: 'st_ch', name: 'ステージ開放(章ごと)', price: 100 },
  ],
  "特別・保証メニュー": [
    { id: 'all_c', name: '全キャラ解放', price: 150 },
    { id: 'err_del', name: 'エラーキャラ削除', price: 200 },
    { id: 'ban', name: '🛡️ BAN保証オプション', price: 500 },
  ]
};

const SERVICES_ACCOUNT = [
  { id: 'acc_basic', name: '【基本セット】猫缶+XP', price: 400, desc: '初期状態から最強へ' },
  { id: 'acc_strong', name: '【最強セット】猫缶+XP+全キャラ', price: 500, desc: 'エラーキャラ無しの安心垢' },
];

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  
  const isAdmin = window.location.hostname.startsWith('admin.');
  if (isAdmin) return <AdminPanel />; // 管理画面(別コンポーネント)

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleGroup = (name: string) => {
    setOpenGroups(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]);
  };

  const calculateTotal = () => {
    let total = 0;
    // 代行から集計
    Object.values(SERVICES_DAIKO).flat().forEach(p => { if(selected.includes(p.id)) total += p.price; });
    // アカウントから集計
    SERVICES_ACCOUNT.forEach(p => { if(selected.includes(p.id)) total += p.price; });
    return total;
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const orderItems = [...Object.values(SERVICES_DAIKO).flat(), ...SERVICES_ACCOUNT]
      .filter(p => selected.includes(p.id))
      .map(p => p.name).join(', ');

    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: orderItems, total: calculateTotal(),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文完了しました！"); window.location.reload(); }
  };

  return (
    <div style={{ background: '#f5f5f7', color: '#1d1d1f', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI 代行 STORE</header>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* 最初の商品選択画面 */}
        {view === 'main' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div onClick={() => setView('daiko')} style={mainCardS}>
              <div style={{fontSize:'40px'}}>🐾</div>
              <div>
                <h2 style={{margin:0}}>にゃんこ大戦争 代行</h2>
                <p style={{margin:0, color:'#86868b'}}>猫缶・XP・全キャラ解放など</p>
              </div>
            </div>
            <div onClick={() => setView('account')} style={mainCardS}>
              <div style={{fontSize:'40px'}}>🎁</div>
              <div>
                <h2 style={{margin:0}}>アカウント販売</h2>
                <p style={{margin:0, color:'#86868b'}}>作成済み初期垢の即納販売</p>
              </div>
            </div>
          </div>
        )}

        {/* 代行メニュー詳細 (プルダウン形式) */}
        {view === 'daiko' && (
          <div>
            <button onClick={() => {setView('main'); setSelected([]);}} style={backBtnS}>← 戻る</button>
            {Object.entries(SERVICES_DAIKO).map(([groupName, items]) => (
              <div key={groupName} style={dropdownS}>
                <div onClick={() => toggleGroup(groupName)} style={dropdownHeaderS}>
                  <span>{groupName}</span>
                  <span>{openGroups.includes(groupName) ? '▲' : '▼'}</span>
                </div>
                {openGroups.includes(groupName) && (
                  <div style={{padding:'5px'}}>
                    {items.map(p => (
                      <div key={p.id} onClick={() => toggleSelect(p.id)} style={selected.includes(p.id) ? selectedItemS : itemS}>
                        <span>{p.name}</span>
                        <span>¥{p.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* アカウント販売詳細 */}
        {view === 'account' && (
          <div>
            <button onClick={() => {setView('main'); setSelected([]);}} style={backBtnS}>← 戻る</button>
            <div style={{display:'grid', gap:'15px'}}>
              {SERVICES_ACCOUNT.map(p => (
                <div key={p.id} onClick={() => toggleSelect(p.id)} style={selected.includes(p.id) ? selectedMainCardS : mainCardS}>
                  <div>
                    <h3 style={{margin:0}}>{p.name}</h3>
                    <small style={{color:'#86868b'}}>{p.desc}</small>
                  </div>
                  <div style={{fontSize:'20px', fontWeight:'bold'}}>¥{p.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 注文フォーム */}
        {selected.length > 0 && (
          <div style={formS}>
            <h3 style={{textAlign:'center', marginBottom:'20px'}}>注文情報の入力</h3>
            <form onSubmit={handleOrder} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <input name="un" placeholder="お名前" style={inputS} required />
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
                <input name="ap" placeholder="認証番号" style={inputS} required />
              </div>
              <textarea name="p" placeholder="PayPayリンクを貼り付け" style={{...inputS, height:'80px'}} required />
              <div style={totalS}>合計: ¥{calculateTotal()}</div>
              <button type="submit" style={submitBtnS}>注文を確定する</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

// 管理画面は以前のものを想定
function AdminPanel() { return <div style={{padding:'50px', color:'#fff', background:'#000'}}>Admin Domain</div>; }

// スタイル定義
const headerS: any = { padding:'20px', textAlign:'center', fontSize:'22px', fontWeight:'700', borderBottom:'1px solid #d2d2d7', background:'#fff', position:'sticky', top:0, zIndex:100 };
const mainCardS: any = { background:'#fff', padding:'30px', borderRadius:'24px', display:'flex', alignItems:'center', gap:'20px', cursor:'pointer', border:'1px solid #d2d2d7', transition:'0.3s' };
const selectedMainCardS: any = { ...mainCardS, border:'2px solid #0071e3', background:'#f0f7ff' };
const dropdownS: any = { background:'#fff', borderRadius:'18px', border:'1px solid #d2d2d7', marginBottom:'10px', overflow:'hidden' };
const dropdownHeaderS: any = { padding:'18px 20px', cursor:'pointer', display:'flex', justifyContent:'space-between', fontWeight:'bold', background:'#fafafa' };
const itemS: any = { display:'flex', justifyContent:'space-between', padding:'15px 20px', cursor:'pointer', borderBottom:'1px solid #f5f5f7' };
const selectedItemS: any = { ...itemS, background:'#0071e3', color:'#fff' };
const backBtnS: any = { background:'none', border:'none', color:'#0071e3', fontSize:'16px', cursor:'pointer', marginBottom:'20px' };
const formS: any = { marginTop:'40px', background:'#fff', padding:'30px', borderRadius:'30px', boxShadow:'0 20px 40px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'15px', borderRadius:'12px', border:'1px solid #d2d2d7', fontSize:'16px', width:'100%', boxSizing:'border-box' };
const totalS: any = { textAlign:'center', padding:'20px', fontSize:'28px', fontWeight:'bold', color:'#1d1d1f' };
const submitBtnS: any = { background:'#0071e3', color:'#fff', border:'none', padding:'20px', borderRadius:'15px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' };
