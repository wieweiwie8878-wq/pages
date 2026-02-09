import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";

// 商品データ (カテゴリ分け)
const MENU_DAIKO = [
  { id: 'neko', name: '猫缶カンスト', price: 80, desc: '猫缶を最大まで補充' },
  { id: 'xp', name: 'XPカンスト', price: 80, desc: '経験値を最大まで補充' },
  { id: 't_norm', name: '通常チケ指定', price: 80, desc: '1〜100枚まで指定可能' },
  { id: 't_rare', name: 'レアチケ指定', price: 80, desc: '1〜100枚まで指定可能' },
  { id: 'all_c', name: '全キャラ解放', price: 150, desc: '全キャラクターを使用可能に' },
  { id: 'err_del', name: 'エラーキャラ削除', price: 200, desc: '不要なエラーデータを一括削除' },
];

const MENU_ACCOUNT = [
  { id: 'acc_basic', name: '基本セット初期垢', price: 400, desc: '猫缶 + XPカンスト済み' },
  { id: 'acc_strong', name: '最強セット初期垢', price: 500, desc: '猫缶 + XP + 全キャラ解放済み' },
];

const MENU_OPTIONS = [
  { id: 'ban', name: '🛡️ BAN保証', price: 500, desc: '万が一の際の無償復旧サポート' }
];

const ALL_PRODUCTS = [...MENU_DAIKO, ...MENU_ACCOUNT, ...MENU_OPTIONS];

const getBrowserId = () => {
  let id = localStorage.getItem('wei_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('wei_id', id);
  }
  return id;
};

export default function App() {
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    if (selected.length === 0) return alert("商品を選択してください");
    const fd = new FormData(e.target);
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: selected.map(id => ALL_PRODUCTS.find(p => p.id === id)?.name).join(', '),
      total: selected.reduce((s, id) => s + (ALL_PRODUCTS.find(p => p.id === id)?.price || 0), 0),
      browserId: getBrowserId()
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文が完了しました！"); window.location.reload(); }
  };

  useEffect(() => { if (isAdmin && password) refresh(); }, []);

  // --- A. 管理画面 (変更なし) ---
  if (isAdmin) {
    return (
      <div style={{background:'#f6f8fa', color:'#333', minHeight:'100vh', padding:'20px', fontFamily:'sans-serif'}}>
        <h1 style={{borderLeft:'4px solid #0071e3', paddingLeft:'15px'}}>Admin Panel</h1>
        <button onClick={refresh} style={{marginBottom:'20px'}}>↻ 更新</button>
        {data?.orders?.map((o: any) => (
          <div key={o.id} style={{background:'#fff', margin:'10px 0', padding:'15px', borderRadius:'12px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
            <strong>#{o.id} {o.username}</strong> <span style={{color:'#0071e3'}}>¥{o.totalPrice}</span>
            <div style={{fontSize:'12px', color:'#888'}}>IP: {o.ipAddress}</div>
            <div style={{background:'#f0f0f0', padding:'10px', marginTop:'10px', borderRadius:'8px'}}>
              <code>{o.transferCode} / {o.authPassword}</code>
            </div>
            <div style={{fontSize:'13px', marginTop:'10px'}}>内容: {o.services}</div>
            <a href={o.paypayUrl} target="_blank" style={{display:'inline-block', marginTop:'10px'}}>PayPayリンクを開く</a>
          </div>
        ))}
      </div>
    );
  }

  // --- B. ユーザー向けショップ画面 ---
  return (
    <div style={{background:'#f5f5f7', color:'#1d1d1f', minHeight:'100vh', fontFamily:'-apple-system, sans-serif'}}>
      <header style={{background:'rgba(255,255,255,0.8)', backdropFilter:'blur(20px)', padding:'15px', textAlign:'center', position:'sticky', top:0, zIndex:100, borderBottom:'1px solid #d2d2d7'}}>
        <h1 style={{fontSize:'20px', fontWeight:'600', margin:0}}>WEI 代行 STORE</h1>
      </header>

      <main style={{maxWidth:'800px', margin:'0 auto', padding:'40px 20px'}}>
        
        {/* セクション 1: 代行メニュー */}
        <section style={{marginBottom:'50px'}}>
          <h2 style={sectionTitle}>🐾 にゃんこ大戦争 代行メニュー</h2>
          <div style={gridS}>
            {MENU_DAIKO.map(p => (
              <ProductCard key={p.id} p={p} isSelected={selected.includes(p.id)} onToggle={() => toggleSelect(p.id)} />
            ))}
          </div>
        </section>

        {/* セクション 2: アカウント販売 */}
        <section style={{marginBottom:'50px'}}>
          <h2 style={sectionTitle}>🎁 アカウント販売 (ストック)</h2>
          <div style={gridS}>
            {MENU_ACCOUNT.map(p => (
              <ProductCard key={p.id} p={p} isSelected={selected.includes(p.id)} onToggle={() => toggleSelect(p.id)} />
            ))}
          </div>
        </section>

        {/* セクション 3: オプション */}
        <section style={{marginBottom:'50px'}}>
          <h2 style={sectionTitle}>🛡️ 安心オプション</h2>
          <div style={gridS}>
            {MENU_OPTIONS.map(p => (
              <ProductCard key={p.id} p={p} isSelected={selected.includes(p.id)} onToggle={() => toggleSelect(p.id)} />
            ))}
          </div>
        </section>

        {/* 注文フォーム */}
        {selected.length > 0 && (
          <div style={{background:'#fff', padding:'30px', borderRadius:'28px', boxShadow:'0 20px 40px rgba(0,0,0,0.1)', border:'1px solid #eee'}}>
            <h2 style={{textAlign:'center', marginBottom:'30px', fontSize:'24px'}}>注文情報を入力</h2>
            <form onSubmit={handleOrder} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
              <input name="un" placeholder="お名前（Discord名など）" style={inputS} required />
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
                <input name="ap" placeholder="認証番号" style={inputS} required />
              </div>
              <textarea name="p" placeholder="PayPay受取リンク（定型文の貼り付けOK）" style={{...inputS, height:'80px'}} required />
              
              <div style={{textAlign:'center', padding:'20px', background:'#f5f5f7', borderRadius:'15px', margin:'10px 0'}}>
                <span style={{fontSize:'14px', color:'#86868b'}}>お支払い合計</span><br/>
                <span style={{fontSize:'36px', fontWeight:'700'}}>¥{selected.reduce((s, id) => s + (ALL_PRODUCTS.find(p => p.id === id)?.price || 0), 0)}</span>
              </div>
              <button type="submit" style={{background:'#0071e3', color:'#fff', border:'none', padding:'20px', borderRadius:'16px', fontSize:'18px', fontWeight:'600', cursor:'pointer', transition:'0.3s'}}>
                注文を確定して送信
              </button>
            </form>
          </div>
        )}
      </main>
      <footer style={{textAlign:'center', padding:'40px', color:'#86868b', fontSize:'12px'}}>© 2026 Wei Systems / Made in Japan Quality</footer>
    </div>
  );
}

// コンポーネント: 商品カード
function ProductCard({p, isSelected, onToggle}: any) {
  return (
    <div 
      onClick={onToggle}
      style={{
        background: isSelected ? '#f0f7ff' : '#fff',
        padding: '20px', borderRadius: '20px', border: isSelected ? '2px solid #0071e3' : '1px solid #d2d2d7',
        cursor: 'pointer', transition: '0.2s all ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
      }}
    >
      <div>
        <h3 style={{fontSize:'17px', margin:'0 0 5px 0', fontWeight:'600'}}>{p.name}</h3>
        <p style={{fontSize:'12px', color:'#86868b', margin:0}}>{p.desc}</p>
      </div>
      <div style={{marginTop:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{fontSize:'18px', fontWeight:'700'}}>¥{p.price}</span>
        <div style={{width:'24px', height:'24px', borderRadius:'50%', border:'2px solid #d2d2d7', background: isSelected ? '#0071e3' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {isSelected && <span style={{color:'#fff', fontSize:'14px'}}>✓</span>}
        </div>
      </div>
    </div>
  );
}

const sectionTitle = { fontSize: '22px', fontWeight: '600', marginBottom: '20px', paddingLeft: '10px', borderLeft: '4px solid #1d1d1f' };
const gridS = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' };
const inputS = { padding:'15px', borderRadius:'12px', border:'1px solid #d2d2d7', fontSize:'16px', background:'#fff', width:'100%', boxSizing:'border-box' as 'border-box' };
