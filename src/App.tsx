import React, { useState, useEffect } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";

// --- 全代行商品データ定義 ---
const CATEGORIES: any = {
  res: {
    name: "💎 リソース・通貨代行",
    items: [
      { id: 'neko', name: '猫缶カンスト', price: 80, desc: '猫缶を最大(58,983個)まで補充します。' },
      { id: 'xp', name: 'XPカンスト', price: 80, desc: '経験値を最大(99,999,999)まで補充します。' },
      { id: 'np', name: 'NP変更', price: 100, desc: '本能解放に必要なNPを大量に付与します。' },
      { id: 'item', name: '全アイテム変更', price: 100, desc: 'スピードアップやネコボン等の全アイテムを調整。' },
    ]
  },
  ticket: {
    name: "🎫 ガチャ・チケット",
    items: [
      { id: 't_norm', name: '通常チケット指定', price: 80, desc: '通常チケットを1〜100枚の間で指定可能です。' },
      { id: 't_rare', name: 'レアチケット指定', price: 80, desc: 'レアチケットを1〜100枚の間で指定可能です。' },
      { id: 'catseye', name: 'キャッツアイ変更', price: 100, desc: 'キャラ上限解放に必要な全アイを補充。' },
      { id: 'bitan', name: 'ネコビタン変更', price: 100, desc: '全種のネコビタンを大量付与。' },
    ]
  },
  progress: {
    name: "🚩 進行度・ステージ解放",
    items: [
      { id: 'st_one', name: '特定1ステージ解放', price: 80, desc: 'クリアできないステージを1つ解放します。' },
      { id: 'st_ch', name: 'ステージ全解放(章ごと)', price: 100, desc: '日本編・未来編などの章を丸ごと解放。' },
      { id: 'legend', name: 'レジェンドステージ解放', price: 100, desc: 'レジェンドストーリーを進行させます。' },
      { id: 'treasure', name: 'お宝全取得(章ごと)', price: 100, desc: '最高のお宝を章ごとにコンプリートします。' },
    ]
  },
  special: {
    name: "✨ 特別・アカウント操作",
    items: [
      { id: 'all_c', name: '全キャラ解放', price: 150, desc: 'コラボ・限定を含む全キャラクターを取得。' },
      { id: 'err_del', name: 'エラーキャラ削除', price: 200, desc: 'BANリスクとなる不正なキャラデータを清掃。' },
      { id: 'castle', name: '城の素材・Lv変更', price: 100, desc: '城の強化素材とレベルを調整します。' },
      { id: 'ptime', name: 'プレイ時間/リーダーシップ', price: 100, desc: 'プレイデータを見栄え良く調整します。' },
      { id: 'ban', name: '🛡️ 鉄壁BAN保証', price: 500, desc: '万が一の際の無償復旧。最も選ばれています。' },
    ]
  },
  stock: {
    name: "🎁 完成済み初期垢販売",
    items: [
      { id: 'acc_basic', name: '基本セット初期垢', price: 400, desc: '猫缶+XPカンスト済み。すぐに遊べます。' },
      { id: 'acc_strong', name: '最強セット初期垢', price: 500, desc: '猫缶+XP+全キャラ解放済み。えらキャラ無し。' },
    ]
  }
};

export default function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [openCat, setOpenCat] = useState<string | null>("res");
  const isAdmin = window.location.hostname.startsWith('admin.');

  const toggleItem = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(CATEGORIES).forEach((cat: any) => {
      cat.items.forEach((item: any) => {
        if (selected.includes(item.id)) total += item.price;
      });
    });
    return total;
  };

  const handleOrder = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const selectedNames = Object.values(CATEGORIES).flatMap((c: any) => c.items).filter(i => selected.includes(i.id)).map(i => i.name).join(', ');

    const order = {
      username: fd.get('un'), tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: fd.get('p'),
      services: selectedNames, total: calculateTotal(),
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36)
    };
    const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { alert("✅ 注文が完了しました！"); window.location.reload(); }
  };

  if (isAdmin) return <AdminPanel />; // 前回の管理者コードを流用

  return (
    <div style={{ background: '#f5f5f7', color: '#1d1d1f', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
      <header style={headerStyle}>WEI 代行 STORE</header>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 15px' }}>
        
        <h2 style={{fontSize:'28px', fontWeight:'700', textAlign:'center', marginBottom:'40px'}}>メニューを選択</h2>

        {Object.entries(CATEGORIES).map(([key, cat]: any) => (
          <div key={key} style={{marginBottom:'15px'}}>
            <div 
              onClick={() => setOpenCat(openCat === key ? null : key)}
              style={{...catHeaderS, border: openCat === key ? '2px solid #0071e3' : '1px solid #d2d2d7'}}
            >
              <span>{cat.name}</span>
              <span>{openCat === key ? '▲' : '▼'}</span>
            </div>

            {openCat === key && (
              <div style={{display:'grid', gap:'10px', marginTop:'10px', padding:'0 5px'}}>
                {cat.items.map((item: any) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleItem(item.id)}
                    style={{...itemS, border: selected.includes(item.id) ? '2px solid #0071e3' : '1px solid #e5e5ea', background: selected.includes(item.id) ? '#f0f7ff' : '#fff'}}
                  >
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'600'}}>{item.name}</div>
                      <div style={{fontSize:'12px', color:'#86868b'}}>{item.desc}</div>
                    </div>
                    <div style={{fontWeight:'bold', color: selected.includes(item.id) ? '#0071e3' : '#1d1d1f'}}>¥{item.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {selected.length > 0 && (
          <div style={formS}>
            <h3 style={{textAlign:'center', marginBottom:'25px'}}>注文手続き</h3>
            <form onSubmit={handleOrder} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <input name="un" placeholder="お名前 (Discordなど)" style={inputS} required />
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <input name="tc" placeholder="引き継ぎコード" style={inputS} required />
                <input name="ap" placeholder="認証番号" style={inputS} required />
              </div>
              <textarea name="p" placeholder="PayPay受取リンクを貼り付け" style={{...inputS, height:'80px'}} required />
              
              <div style={priceBoxS}>
                <div style={{fontSize:'14px', color:'#86868b'}}>合計金額 (入金自動確認システム)</div>
                <div style={{fontSize:'32px', fontWeight:'bold'}}>¥{calculateTotal().toLocaleString()}</div>
              </div>

              <button type="submit" style={submitBtnS}>注文を確定して送信</button>
            </form>
          </div>
        )}
      </main>
      <footer style={{textAlign:'center', padding:'40px', color:'#86868b', fontSize:'12px'}}>© 2026 Wei Systems Team / Made in Japan</footer>
    </div>
  );
}

function AdminPanel() { return <div style={{background:'#000', color:'#fff', height:'100vh', padding:'20px'}}>Admin Domain (以前のコードをここに貼る)</div>; }

// スタイル
const headerStyle: any = { background:'rgba(255,255,255,0.8)', backdropFilter:'blur(20px)', padding:'20px', textAlign:'center', fontWeight:'bold', fontSize:'20px', borderBottom:'1px solid #d2d2d7', position:'sticky', top:0, zIndex:100 };
const catHeaderS: any = { padding:'20px', background:'#fff', borderRadius:'16px', display:'flex', justifyContent:'space-between', fontWeight:'600', cursor:'pointer', transition:'0.3s' };
const itemS: any = { padding:'15px 20px', borderRadius:'14px', display:'flex', alignItems:'center', cursor:'pointer', transition:'0.2s' };
const formS: any = { marginTop:'50px', background:'#fff', padding:'30px', borderRadius:'28px', boxShadow:'0 20px 40px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'15px', borderRadius:'12px', border:'1px solid #d2d2d7', background:'#f5f5f7', fontSize:'16px', width:'100%', boxSizing:'border-box' };
const priceBoxS: any = { textAlign:'center', padding:'20px', background:'#f5f5f7', borderRadius:'15px', margin:'10px 0' };
const submitBtnS: any = { background:'#0071e3', color:'#fff', border:'none', padding:'20px', borderRadius:'16px', fontSize:'18px', fontWeight:'600', cursor:'pointer' };
