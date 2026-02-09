import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";

// 商品データ
const CATEGORIES: any = {
  account: {
    name: "🎁 アカウント販売 (ストック)",
    items: [
      { id: 'acc_basic', name: '基本セット初期垢', price: 400, desc: '猫缶 + XPカンスト済み' },
      { id: 'acc_strong', name: '最強セット初期垢', price: 500, desc: '猫缶 + XP + 全キャラ解放済み' },
    ]
  },
  daiko: {
    name: "🐾 にゃんこ大戦争 代行メニュー",
    groups: [
      {
        title: "💰 80円均一メニュー",
        items: [
          { id: 'neko', name: '猫缶カンスト', price: 80 },
          { id: 'xp', name: 'XPカンスト', price: 80 },
          { id: 't_norm', name: '通常チケ指定(1-100)', price: 80 },
          { id: 't_rare', name: 'レアチケ指定(1-100)', price: 80 },
          { id: 'st_one', name: 'ステージ開放 (1ステ)', price: 80 },
        ]
      },
      {
        title: "💰 100円均一メニュー",
        items: [
          { id: 'np', name: 'NP変更', price: 100 },
          { id: 'item', name: 'アイテム変更', price: 100 },
          { id: 'eye', name: 'キャッツアイ変更', price: 100 },
          { id: 'bitan', name: 'ネコビタン変更', price: 100 },
          { id: 'leader', name: 'リーダーシップ変更', price: 100 },
          { id: 'ptime', name: 'プレイ時間変更', price: 100 },
          { id: 'clv', name: '城のレベル変更', price: 100 },
          { id: 'st_ch', name: 'ステージ開放(章ごと)', price: 100 },
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
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'account' | 'daiko'>('daiko');
  const [openGroups, setOpenGroups] = useState<string[]>(["💰 80円均一メニュー"]);
  const [selected, setSelected] = useState<string[]>([]);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(CATEGORIES).forEach((cat: any) => {
      if (cat.items) cat.items.forEach((p: any) => { if (selected.includes(p.id)) total += p.price; });
      if (cat.groups) cat.groups.forEach((g: any) => g.items.forEach((p: any) => { if (selected.includes(p.id)) total += p.price; }));
    });
    return total;
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: selected.join(', '), total: calculateTotal(),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("注文完了！"); window.location.reload(); }
  };

  if (isAdmin) return <AdminPanel data={data} refresh={() => {}} />; // 管理画面は省略（以前の物を流用）

  return (
    <div style={{ background: '#f5f5f7', color: '#1d1d1f', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <nav style={{ background: '#fff', padding: '15px 20px', borderBottom: '1px solid #d2d2d7', textAlign: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>WEI 代行 SHOP</span>
      </nav>

      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        
        {/* カテゴリー選択タブ */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', background: '#e5e5ea', padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => {setActiveTab('daiko'); setSelected([]);}} style={activeTab === 'daiko' ? activeTabS : inactiveTabS}>代行依頼</button>
          <button onClick={() => {setActiveTab('account'); setSelected([]);}} style={activeTab === 'account' ? activeTabS : inactiveTabS}>アカウント購入</button>
        </div>

        {/* 内容表示 */}
        <div style={{ marginBottom: '30px' }}>
          {activeTab === 'account' ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {CATEGORIES.account.items.map((p: any) => (
                <div key={p.id} onClick={() => toggleSelect(p.id)} style={selected.includes(p.id) ? selectedItemS : itemS}>
                  <div><div style={{fontWeight:'600'}}>{p.name}</div><small style={{color:'#86868b'}}>{p.desc}</small></div>
                  <div style={{fontWeight:'bold'}}>¥{p.price}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {CATEGORIES.daiko.groups.map((g: any) => (
                <div key={g.title} style={{ marginBottom: '10px', background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #d2d2d7' }}>
                  <div onClick={() => toggleGroup(g.title)} style={{ padding: '15px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
                    <span style={{ fontWeight: 'bold' }}>{g.title}</span>
                    <span>{openGroups.includes(g.title) ? '▲' : '▼'}</span>
                  </div>
                  {openGroups.includes(g.title) && (
                    <div style={{ padding: '10px' }}>
                      {g.items.map((p: any) => (
                        <div key={p.id} onClick={() => toggleSelect(p.id)} style={selected.includes(p.id) ? selectedSubItemS : subItemS}>
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
        </div>

        {/* 注文フォーム */}
        {selected.length > 0 && (
          <form onSubmit={handleOrder} style={{ background: '#fff', padding: '25px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>注文情報の入力</h3>
            <input name="un" placeholder="お名前 (Discord名など)" style={inputS} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
              <input name="ap" placeholder="認証番号" style={inputS} required />
            </div>
            <textarea name="p" placeholder="PayPay受取リンク (定型文貼り付けOK)" style={{ ...inputS, height: '80px' }} required />
            <div style={{ textAlign: 'center', padding: '20px', fontSize: '24px', fontWeight: 'bold' }}>合計: ¥{calculateTotal()}</div>
            <button type="submit" style={{ width: '100%', background: '#0071e3', color: '#fff', border: 'none', padding: '18px', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>注文を確定して送信</button>
          </form>
        )}
      </main>
    </div>
  );
}

// 管理画面の簡易版（必要に応じて前述のフル版を合体させてください）
function AdminPanel({data, refresh}: any) { return <div style={{padding:'20px', color:'#fff', background:'#000', minHeight:'100vh'}}>Admin Mode</div>; }

// スタイル
const activeTabS: any = { flex: 1, padding: '10px', border: 'none', background: '#fff', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const inactiveTabS: any = { flex: 1, padding: '10px', border: 'none', background: 'transparent', color: '#86868b', cursor: 'pointer' };
const itemS: any = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #d2d2d7', cursor: 'pointer' };
const selectedItemS: any = { ...itemS, border: '2px solid #0071e3', background: '#f0f7ff' };
const subItemS: any = { display: 'flex', justifyContent: 'space-between', padding: '12px 15px', margin: '4px 0', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', border: '1px solid transparent' };
const selectedSubItemS: any = { ...subItemS, background: '#0071e3', color: '#fff' };
const inputS: any = { padding: '12px', borderRadius: '10px', border: '1px solid #d2d2d7', width: '100%', boxSizing: 'border-box', marginBottom: '10px' };
