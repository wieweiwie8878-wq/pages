import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkersのURL

// 商品データにdescriptionフィールドを追加し、リストを更新しました
const DAIKO_ITEMS = [
  // 80円グループ
  { id: 'neko', name: '猫缶カンスト', price: 80, description: '猫缶を最大値まで増加させます。' },
  { id: 'xp', name: 'XPカンスト', price: 80, description: 'XPを最大値まで増加させます。' },
  { id: 't_norm', name: '通常チケ(100枚)', price: 80, description: '通常チケットを100枚付与します。' },
  { id: 't_rare', name: 'レアチケ(100枚)', price: 80, description: 'レアチケットを100枚付与します。' },
  { id: 'st_one', name: '1ステージ開放', price: 80, description: '任意のステージを1つ解放します。' },

  // 100円グループ
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

  // 150円グループ
  { id: 'all_c', name: '全キャラ解放', price: 150, description: '全てのキャラクターを解放します。' },

  // 200円 (元のリストにあった項目、今回は変更なし)
  { id: 'err', name: 'エラーキャラ消去', price: 200, description: 'エラー表示されているキャラクターを削除します。' },

  // 500円グループ
  { id: 'ban_g', name: '🛡️ BAN保証オプション', price: 500, description: '万が一のアカウントBAN時に保証を提供します。（超推奨）' }
];

const ACC_ITEMS = [
  { id: 'acc_b', name: '基本初期垢', price: 400, description: '猫缶とXPがカンスト済みの基本アカウントです。' },
  { id: 'acc_s', name: '最強初期垢', price: 500, description: '猫缶、XP、全キャラ解放（一部を除く）の最強アカウントです。' }
];

// DAIKO_LIST と ACC_LIST が定義されていなかったので、既存のDAIKO_ITEMSとACC_ITEMSを参照するようにしました
const DAIKO_LIST = DAIKO_ITEMS;
const ACC_LIST = ACC_ITEMS;

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);
  const adminAction = (id: any, action: string, extra = {}) => {
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(refresh);
  };

  useEffect(() => { if (isAdmin && password) refresh(); }, []);

  if (isAdmin) {
    if (!isLoggedIn && !data) return (
      <div style={centerS}><h1 style={{color:'#4af'}}>WEI ADMIN</h1><input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inputS}/><button onClick={()=>{setIsLoggedIn(true);refresh();localStorage.setItem('admin_pw',password);}} style={btnS}>LOGIN</button></div>
    );
    return (
      <div style={{background:'#000', color:'#fff', minHeight:'100vh', padding:'20px', fontFamily:'monospace'}}>
        <h2>魏 司令官：管理画面</h2>
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

  // アコーディオンの開閉状態を管理する新しいステート
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}> {/* gridからflexに変更し、縦に並べます */}
              {(view === 'daiko' ? DAIKO_LIST : ACC_LIST).map(p => {
                const isSelected = selected.includes(p.id);
                const isExpanded = expandedItems.includes(p.id);

                const toggleItem = () => {
                  // 選択状態の切り替え
                  setSelected(prev =>
                    prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id]
                  );
                  // 展開状態の切り替え
                  setExpandedItems(prev =>
                    prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                  );
                };

                return (
                  <div key={p.id} style={itemContainerS}>
                    {/* アコーディオンのヘッダー部分 */}
                    <div onClick={toggleItem} style={isSelected ? selectedHeaderS : itemHeaderS}>
                      <div>{p.name}</div>
                      <div style={{color: isSelected ? '#0071e3' : '#333'}}>{isExpanded ? '▲' : '▼'}</div> {/* 展開状態を示すアイコン */}
                    </div>
                    {/* アコーディオンの詳細部分 (展開されている場合のみ表示) */}
                    {isExpanded && (
                      <div style={itemDetailS}>
                        <div style={{color: '#0071e3', fontWeight: 'bold', marginBottom: '5px'}}>¥{p.price}</div>
                        <div>{p.description}</div>
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
            const all = [...DAIKO_LIST, ...ACC_LIST];
            const order = { username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'), services: all.filter(p=>selected.includes(p.id)).map(p=>p.name).join(','), total: all.filter(p=>selected.includes(p.id)).reduce((s,p)=>s+p.price,0), browserId: localStorage.getItem('wei_id') || Math.random().toString(36)};
            await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
            alert("注文完了しました！"); window.location.reload();
          }} style={formS}>
            <input name="un" placeholder="お名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}><input name="tc" placeholder="コード" style={inputS} required /><input name="ap" placeholder="パス" style={inputS} required /></div>
            <textarea name="p" placeholder="PayPayリンク" style={{...inputS, height:'80px'}} required />
            <button type="submit" style={submitBtnS}>¥{selected.reduce((s,id) => s + ([...DAIKO_LIST, ...ACC_LIST].find(p=>p.id===id)?.price || 0), 0)} で確定</button>
          </form>
        )}
      </main>
    </div>
  );
}

const headerS: any = { padding:'15px', textAlign:'center', fontSize:'18px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const mainCardS: any = { background:'#fff', padding:'50px 20px', borderRadius:'20px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', fontSize:'18px', fontWeight:'bold' };
// 元のitemS, selectedS は新しいアコーディオン形式には不要になったため、ここでは使用しません

// 新しいアコーディオン用のスタイル定義
const itemContainerS: any = {
  background: '#fff',
  borderRadius: '12px',
  border: '1px solid #d2d2d7',
  overflow: 'hidden', // 展開/折りたたみの境界をきれいに見せます
};
const itemHeaderS: any = {
  padding: '15px 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '15px', // 少し大きくする
  fontWeight: 'bold', // 太字にする
};
const selectedHeaderS: any = {
  ...itemHeaderS,
  border: '2px solid #0071e3', // 選択されている場合は枠線を変更
  background: '#f0f7ff', // 選択されている場合は背景色を変更
};
const itemDetailS: any = {
  padding: '10px 15px',
  borderTop: '1px solid #eee', // ヘッダーとの境界線
  background: '#f9f9f9',
  fontSize: '13px', // 少し大きくする
  color: '#555',
};

const formS: any = { marginTop:'40px', background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'12px', borderRadius:'10px', border:'1px solid #d2d2d7', width:'100%', boxSizing:'border-box', marginBottom:'10px' };
const submitBtnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'bold', cursor:'pointer' };
const copyS: any = { flex:1, background:'#222', color:'#fa0', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer' };
const centerS: any = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000' };
const btnS: any = { background:'#4af', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'5px', cursor:'pointer' };
