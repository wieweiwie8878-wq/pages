import React, { useState, useEffect, useMemo } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // WorkersのURL

// Discord設定 (ご自身のClient IDに書き換えてください)
const DISCORD_CLIENT_ID = "1456569335190388951"; 
const REDIRECT_URI = "https://kenji123.f5.si/"; // 本番環境のURL

// ... (DAIKO_CATEGORIES, ACC_ITEMS, styles 定義は前回と同じ)
// styles に以下を追加してください
// discordBtn: {
//   background: '#5865F2',
//   color: '#fff',
//   border: 'none',
//   padding: '12px 20px',
//   borderRadius: '8px',
//   fontWeight: 'bold',
//   fontSize: '16px',
//   cursor: 'pointer',
//   display: 'flex',
//   alignItems: 'center',
//   gap: '10px',
//   marginBottom: '20px',
//   width: '100%',
//   justifyContent: 'center',
// },

// ...

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ユーザー情報
  const [discordUser, setDiscordUser] = useState<any>(null);

  // 注文フォーム用state
  const [formOpen, setFormOpen] = useState(false);
  const [paypayLinkValue, setPaypayLinkValue] = useState('');
  const [paypayLinkError, setPaypayLinkError] = useState<string | null>(null);
  
  // Admin用
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  // モーダル
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  // Discordログイン処理
  const handleDiscordLogin = () => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  };

  // 初期ロード時の処理 (Adminチェック & Discordコールバックチェック)
  useEffect(() => {
    // Admin自動ログイン
    if (isAdmin && password && !isLoggedIn) {
      setTimeout(() => refreshAdmin(password), 500);
    }

    // Discordログインからのリダイレクト処理
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      // コード除去してURLを綺麗にする
      window.history.replaceState({}, document.title, "/");
      
      // Backendで認証
      fetch(`${API_BASE}/api/auth/discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri: REDIRECT_URI }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setDiscordUser(data);
          localStorage.setItem('discord_user', JSON.stringify(data));
          setModalMsg(`ようこそ、${data.username}さん！\nログインしました。`);
          setShowModal(true);
        } else {
          setModalMsg("ログインに失敗しました。");
          setShowModal(true);
        }
      })
      .catch(err => console.error(err));
    } else {
      // 既にログイン済みかチェック
      const saved = localStorage.getItem('discord_user');
      if (saved) setDiscordUser(JSON.parse(saved));
    }
  }, [isAdmin]);

  const refreshAdmin = async (pw: string) => { /* ...前回と同じ... */ };
  const adminAction = (id: any, action: string, extra = {}) => { /* ...前回と同じ... */ };

  // ... (Admin画面描画ロジックは前回と同じ) ...

  // ユーザー画面ロジック
  // ... (toggle系関数は前回と同じ) ...

  const handlePaypay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaypayLinkValue(val);
    setPaypayLinkError(val && /paypay\.ne\.jp/.test(val) ? null : 'PayPayのリンクを含めてください');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (paypayLinkError) return;
    
    // Discordログイン必須にする場合
    if (!discordUser) {
        setModalMsg("⚠️ 注文にはDiscordログインが必要です。");
        setShowModal(true);
        return;
    }
    
    const fd = new FormData(e.currentTarget);
    const order = {
      username: discordUser.username, // 名前はDiscordから自動取得
      discordUserId: discordUser.id,  // Discord IDを送信
      tc: fd.get('tc'),
      ap: fd.get('ap'),
      paypayUrl: paypayLinkValue,
      services: allItemsFlat.filter(p=>selected.includes(p.id)).map(p=>p.name).join(','),
      total: totalSelectedPrice,
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36).substring(2, 15)
    };

    try {
      await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
      setModalMsg("✅ 注文を受け付けました！\n完了時にBotからDMが届きます。\n(BotからのDMを許可しておいてください)");
      setShowModal(true);
      setFormOpen(false);
      setSelected([]);
    } catch (err) {
      setModalMsg("❌ 送信エラーが発生しました。");
      setShowModal(true);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>WEI STORE 🐾</h1>
        {discordUser && <div style={{fontSize:'12px', color:'#0071e3'}}>Logged in as: {discordUser.username}</div>}
      </header>

      <main style={styles.main}>
        {/* ... (メインメニュー、商品リスト表示部分は前回と同じ) ... */}
        
        {/* 注文フォーム */}
        {formOpen && selected.length > 0 && (
          <div style={styles.formContainer}>
            <h2 style={{textAlign:'center', marginBottom:'20px'}}>注文情報の入力</h2>
            
            {/* Discordログインボタン */}
            {!discordUser ? (
                <button onClick={handleDiscordLogin} style={{background: '#5865F2', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', width: '100%', fontWeight: 'bold', cursor: 'pointer', marginBottom:'20px'}}>
                    👾 Discordでログインして注文に進む
                </button>
            ) : (
                <form onSubmit={handleSubmit}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>お名前</label>
                    <input value={discordUser.username} disabled style={{...styles.input, background:'#eee'}} />
                  </div>
                  {/* ... (引き継ぎコード、認証番号、PayPayリンク入力欄は前回と同じ) ... */}
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                    <div>
                      <label style={styles.label}>引き継ぎコード</label>
                      <input name="tc" required style={styles.input} placeholder="xxxxxxxxx" />
                    </div>
                    <div>
                      <label style={styles.label}>認証番号</label>
                      <input name="ap" required style={styles.input} placeholder="xxxx" />
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>PayPayリンク (送金リンク)</label>
                    <input name="p" required style={styles.input} placeholder="https://paypay.ne.jp/link/..." value={paypayLinkValue} onChange={handlePaypay} />
                    {paypayLinkError && <div style={styles.errorMsg}>{paypayLinkError}</div>}
                  </div>

                  <button type="submit" style={{...styles.checkoutBtn, width:'100%'}} disabled={!!paypayLinkError}>
                    ¥{totalSelectedPrice} で注文確定
                  </button>
                  <button type="button" onClick={()=>setFormOpen(false)} style={{width:'100%', padding:'10px', background:'none', border:'none', color:'#777', cursor:'pointer', marginTop:'10px'}}>キャンセル</button>
                </form>
            )}
          </div>
        )}
      </main>
      
      {/* ... (フッター、モーダル表示は前回と同じ) ... */}
      {!formOpen && selected.length > 0 && (
        <div style={styles.floatingFooter}>
          <div style={{fontWeight:'bold', fontSize:'16px'}}>
            {selected.length}点 <span style={{color:'#0071e3', marginLeft:'5px'}}>¥{totalSelectedPrice}</span>
          </div>
          <button onClick={() => setFormOpen(true)} style={styles.checkoutBtn}>手続きへ</button>
        </div>
      )}

      {showModal && <CustomModal message={modalMsg} onClose={() => { setShowModal(false); if(modalMsg.includes('注文を受け付け')) window.location.reload(); }} />}
    </div>
  );
}
