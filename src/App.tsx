import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkersのURL

// 商品データをカテゴリでグループ化しました
const DAIKO_CATEGORIES = [
  {
    id: 'price80',
    name: '80円メニュー',
    description: '猫缶、XPカンスト、チケット付与、1ステージ開放などがお得なセットです。',
    items: [
      { id: 'neko', name: '猫缶カンスト', price: 80, description: '猫缶を最大値まで増加させます。' },
      { id: 'xp', name: 'XPカンスト', price: 80, description: 'XPを最大値まで増加させます。' },
      { id: 't_norm', name: '通常チケ(100枚)', price: 80, description: '通常チケットを100枚付与します。' },
      { id: 't_rare', name: 'レアチケ(100枚)', price: 80, description: 'レアチケットを100枚付与します。' },
      { id: 'st_one', name: '1ステージ開放', price: 80, description: '任意のステージを1つ解放します。' },
    ]
  },
  {
    id: 'price100',
    name: '100円メニュー',
    description: 'NP、アイテム、キャッツアイ、城素材など、多岐にわたる変更が可能です。',
    items: [
      { id: 'np', name: 'NP変更', price: 100, description: 'NPの値を変更します。' },
      { id: 'item', name: 'アイテム変更', price: 100, description: '各種アイテムの数を変更します。' },
      { id: 'eye', name: 'キャッツアイ', price: 100, description: 'キャッツアイの値を変更します。' },
      { id: 'bitan', name: 'ネコビタン変更', price: 100, description: 'ネコビタンの数を変更します。' },
      { id: 'castle_m', name: '城素材変更', price: 100, description: '城の素材の数を変更します。' },
      { id: 'matatabi', name: 'マタタビ変更', price: 100, description: 'マタタビの数を変更します。' },
      { id: 'leader', name: 'リーダーシップ', price: 100, description: 'リーダーシップの数を変更します。' },
      { id: 'ptime', name: 'プレイ時間', price: 100, description: 'プレイ時間を変更します。' },
      { id: 'clv', name: '城のレベル', price: 100, description: '城のレベルを変更します。' },
      { id: 'g_char', name: 'グループキャラ解放', price: 100, description: 'グループキャラクターを解放します。' },
      { id: 'st_ch', name: 'ステージ章解放', price: 100, description: 'ステージの章を解放します。' },
      { id: 'legend', name: 'レジェステ解放', price: 100, description: 'レジェンドステージを解放します。' },
      { id: 'treasure', name: 'お宝解放', price: 100, description: 'お宝を解放します。' },
    ]
  },
  {
    id: 'price150',
    name: '150円メニュー',
    description: '全てのキャラクターを解放するスペシャルメニューです。',
    items: [
      { id: 'all_c', name: '全キャラ解放', price: 150, description: '全てのキャラクターを解放します。' },
    ]
  },
  {
    id: 'price200',
    name: '200円メニュー',
    description: 'エラー表示されているキャラクターを安全に削除します。',
    items: [
      { id: 'err', name: 'エラーキャラ消去', price: 200, description: 'エラー表示されているキャラクターを削除します。' },
    ]
  },
  {
    id: 'price500',
    name: '500円メニュー',
    description: '万が一のアカウントBAN時に保証を提供する、超推奨オプションです。',
    items: [
      { id: 'ban_g', name: '🛡️ BAN保証オプション', price: 500, description: '万が一のアカウントBAN時に保証を提供します。（超推奨）' },
    ]
  }
];

const ACC_ITEMS = [
  { id: 'acc_b', name: '【基本セット】400円', price: 400, description: '猫缶とXPがカンスト済みの基本アカウントです。' },
  { id: 'acc_s', name: '【最強セット】500円', price: 500, description: '猫缶、XP、全キャラ解放（一部を除く）の最強アカウントです。' }
];

// DAIKO_LIST は DAIKO_CATEGORIES からすべてのアイテムをフラットにして取得するように変更
const DAIKO_LIST = DAIKO_CATEGORIES.flatMap(category => category.items);
const ACC_LIST = ACC_ITEMS; // 垢販売は今回はカテゴリ分けなし

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  // カテゴリのアコーディオン開閉状態を管理するステート
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);
  const adminAction = (id: any, action: string, extra = {}) => {
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(refresh);
  };

  useEffect(() => {
    if (isAdmin && isLoggedIn) { // isLoggedInがtrueの場合のみrefreshを呼ぶ
      refresh();
    } else if (isAdmin && password) { // パスワードがlocalStorageにあれば、ログインを試みる
      fetch(`${API_BASE}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setIsLoggedIn(true);
          refresh();
        } else {
          // パスワードが間違っているか認証失敗、localStorageのパスワードをクリア
          localStorage.removeItem('admin_pw');
          setPassword('');
          setIsLoggedIn(false); // ログイン失敗
        }
      })
      .catch(() => {
        // APIエラーなど、ログイン失敗
        localStorage.removeItem('admin_pw');
        setPassword('');
        setIsLoggedIn(false);
      });
    }
  }, [isAdmin, isLoggedIn]); // isAdmin, isLoggedIn の変更時に実行

  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={centerS}>
        <h1 style={{color:'#4af'}}>WEI ADMIN</h1>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inputS} placeholder="Admin Password" />
        <button onClick={async ()=>{
          const res = await fetch(`${API_BASE}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
          });
          const data = await res.json();
          if (data.ok) {
            setIsLoggedIn(true);
            localStorage.setItem('admin_pw', password);
            refresh();
          } else {
            alert('ログイン失敗: パスワードが違います。');
            setIsLoggedIn(false);
          }
        }} style={btnS}>LOGIN</button>
      </div>
    );
    return (
      <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
        <h2>魏 司令官：管理画面</h2>
        <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('admin_pw'); setPassword(''); setData(null); }} style={{...btnS, marginBottom: '20px', background: '#dc3545'}}>ログアウト</button>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#111', border:'1px solid #333', padding:'15px', borderRadius:'10px'}}>
              <strong>#{o.id} {o.username} <span style={{color:'#4af'}}>¥{o.totalPrice}</span></strong>
              <div style={{fontSize:'12px', color:'#ff4444'}}>IP: {o.ipAddress}</div>
              <div style={{background:'#222', padding:'10px', marginTop:'10px'}}><code>{o.transferCode} / {o.authPassword}</code></div>
              <div style={{fontSize:'12px', marginTop:'10px'}}>{o.services}</div>
              <div style={{display:'flex', gap:'5px', marginTop:'10px'}}>
                <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>adminAction(o.id, 'complete', {image: e.target.files![0], userId: o.userId})} />
                <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#28a745', color:'#fff', border:'none', borderRadius:'5px'}}>完了通知</button>
                <button onClick={()=>adminAction(o.id, 'scrub')} style={{background:'#555', border:'none', color:'#fff', borderRadius:'5px'}}>抹消</button>
                <a href={o.paypayUrl} target="_blank" style={{background:'#fff', color:'#000', textDecoration:'none', padding:'5px 10px', borderRadius:'5px'}}>PayPay</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // カテゴリごとのアコーディオン開閉トグル
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  // 商品選択トグル
  const toggleItemSelection = (itemId: string) => {
    setSelected(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // 全てのアイテムリスト（フォームの合計金額計算用）
  const allItemsFlat = [...DAIKO_LIST, ...ACC_LIST];

  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerS}>WEI STORE</header>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        {view === 'main' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div onClick={() => setView('daiko')} style={mainCardS}>🐾 代行</div>
            <div onClick={() => setView('account')} style={mainCardS}>🎁 垢販売</div>
          </div>
        ) : (
          <div>
            <button onClick={() => setView('main')} style={{color:'#0071e3', border:'none', background:'none', marginBottom:'15px'}}>← 戻る</button>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {(view === 'daiko' ? DAIKO_CATEGORIES : [{ id: 'account_sales', name: 'アカウント販売', description: '初期アカウントを販売しています。', items: ACC_LIST }]).map(category => {
                const isCategoryExpanded = expandedCategories.includes(category.id);
                return (
                  <div key={category.id} style={categoryContainerS}>
                    {/* カテゴリアコーディオンのヘッダー */}
                    <div onClick={() => toggleCategory(category.id)} style={categoryHeaderS}>
                      <div>{category.name}</div>
                      <div style={{fontSize:'12px', color:'#777'}}>{isCategoryExpanded ? '▲' : '▼'}</div>
                    </div>
                    {/* カテゴリアコーディオンの詳細部分 (展開されている場合のみ表示) */}
                    {isCategoryExpanded && (
                      <div style={categoryContentS}>
                        <p style={{fontSize:'13px', color:'#666', marginBottom:'10px'}}>{category.description}</p>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                          {category.items.map(item => {
                            const isItemSelected = selected.includes(item.id);
                            return (
                              <div key={item.id} onClick={() => toggleItemSelection(item.id)} style={isItemSelected ? itemSelectedS : itemDefaultS}>
                                <div style={{fontWeight:'bold'}}>{item.name} <span style={{color:'#0071e3'}}>¥{item.price}</span></div>
                                <div style={{fontSize:'11px', color:'#888'}}>{item.description}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {selected.length > 0 && (
          <form onSubmit={async (e:any)=>{
            e.preventDefault();
            const fd = new FormData(e.target);
            const order = {
              username: fd.get('un'),
              tc: fd.get('tc'),
              ap: fd.get('ap'),
              paypayUrl: fd.get('p'),
              services: allItemsFlat.filter(p=>selected.includes(p.id)).map(p=>p.name).join(','),
              total: allItemsFlat.filter(p=>selected.includes(p.id)).reduce((s,p)=>s+p.price,0),
              browserId: localStorage.getItem('wei_id') || Math.random().toString(36).substring(2, 15) // 重複を避けるため短縮
            };
            await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
            alert("注文完了しました！"); window.location.reload();
          }} style={formS}>
            <input name="un" placeholder="お名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}><input name="tc" placeholder="コード" style={inputS} required /><input name="ap" placeholder="パス" style={inputS} required /></div>
            <textarea name="p" placeholder="PayPayリンク" style={{...inputS, height:'80px'}} required />
            <button type="submit" style={submitBtnS}>¥{selected.reduce((s,id) => s + (allItemsFlat.find(p=>p.id===id)?.price || 0), 0)} で確定</button>
          </form>
        )}
      </main>
    </div>
  );
}

// スタイル定義
const headerS: any = { padding:'15px', textAlign:'center', fontSize:'18px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const mainCardS: any = { background:'#fff', padding:'50px 20px', borderRadius:'20px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', fontSize:'18px', fontWeight:'bold' };

// カテゴリアコーディオン用のスタイル
const categoryContainerS: any = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #d2d2d7',
  overflow: 'hidden',
};
const categoryHeaderS: any = {
  padding: '15px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  background: '#e9e9eb', // カテゴリヘッダーの背景色
};
const categoryContentS: any = {
  padding: '10px 15px',
  borderTop: '1px solid #eee',
  background: '#fcfcfc',
};

// 個々の商品アイテム用のスタイル
const itemDefaultS: any = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eee',
  cursor: 'pointer',
  marginBottom: '5px',
  background: '#fff',
};
const itemSelectedS: any = {
  ...itemDefaultS,
  border: '2px solid #0071e3', // 選択されたアイテムの枠線
  background: '#e0f2ff', // 選択されたアイテムの背景色
};

const formS: any = { marginTop:'40px', background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'12px', borderRadius:'10px', border:'1px solid #d2d2d7', width:'100%', boxSizing:'border-box', marginBottom:'10px' };
const submitBtnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'bold', cursor:'pointer' };
const copyS: any = { flex:1, background:'#222', color:'#fa0', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer' };
const centerS: any = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000' };
const btnS: any = { background:'#4af', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'5px', cursor:'pointer' };
