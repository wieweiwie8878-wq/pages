import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // WorkersのURL

// Discord設定
const DISCORD_CLIENT_ID = "1456569335190388951"; 
const REDIRECT_URI = "https://kenji123.f5.si/"; 
const SUPPORT_SERVER_URL = "https://discord.gg/YOUR_INVITE_CODE"; // サーバー招待リンク

// 商品データの定義
const DAIKO_CATEGORIES = [
  {
    id: 'basic_services_80',
    name: '💰 80円 基本強化パック',
    description: 'ゲーム進行の基礎となる必須アイテムをお得に強化。',
    items: [
      { id: 'neko', name: '猫缶カンスト', price: 80, description: '猫缶を最大値（約99999）まで増加。ガチャ引き放題！' },
      { id: 'xp', name: 'XPカンスト', price: 80, description: 'XPを最大値（約99999999）まで増加。キャラ強化に必須！' },
      { id: 't_norm', name: '通常チケ(100枚)', price: 80, description: '通常チケットを上限の100枚まで付与。' },
      { id: 't_rare', name: 'レアチケ(100枚)', price: 80, description: 'レアチケットを上限の100枚まで付与。' },
      { id: 'st_one', name: '1ステージ開放', price: 80, description: '攻略が難しいステージを1つ指定して開放。' },
    ]
  },
  {
    id: 'advanced_custom_100',
    name: '✨ 100円 応用カスタム',
    description: 'NP、アイテム、素材など、玄人向けの細かい調整が可能。',
    items: [
      { id: 'np', name: 'NP変更', price: 100, description: '本能解放に必要なNPを好きなだけ変更。' },
      { id: 'item', name: 'アイテム変更', price: 100, description: 'スピードアップ、ネコボンなどの戦闘アイテム数を変更。' },
      { id: 'eye', name: 'キャッツアイ変更', price: 100, description: 'レベル上限解放に必要なキャッツアイを変更。' },
      { id: 'bitan', name: 'ネコビタン変更', price: 100, description: 'ステージ再挑戦に使えるネコビタンを変更。' },
      { id: 'castle_m', name: '城素材変更', price: 100, description: '城開発に必要なレンガ、羽根などの素材を変更。' },
      { id: 'matatabi', name: 'マタタビ変更', price: 100, description: '進化に必要なマタタビ各種を変更。' },
      { id: 'leader', name: 'リーダーシップ変更', price: 100, description: 'スタミナ回復アイテム「リーダーシップ」を変更。' },
      { id: 'ptime', name: 'プレイ時間変更', price: 100, description: 'アカウントの総プレイ時間を自然な値に変更。' },
      { id: 'clv', name: '城のレベル変更', price: 100, description: 'にゃんこ城のレベルを直接変更。' },
      { id: 'g_char', name: 'グループキャラ解放', price: 100, description: '特定のガチャシリーズなどをまとめて解放。' },
      { id: 'st_ch', name: 'ステージ章解放', price: 100, description: '日本編、未来編などの章をクリア済みに。' },
      { id: 'legend', name: 'レジェステ解放', price: 100, description: 'レジェンドストーリーのステージを解放。' },
      { id: 'treasure', name: 'お宝解放', price: 100, description: '日本編〜宇宙編のお宝をコンプリート状態に。' },
    ]
  },
  {
    id: 'all_characters_150',
    name: '😼 150円 全キャラ解放',
    description: '最強の布陣を一瞬で。コラボキャラ以外を全解禁。',
    items: [
      { id: 'all_c', name: '全キャラ解放', price: 150, description: '全てのキャラクターを解放（一部コラボ除く）。最強のデータへ。' },
    ]
  },
  {
    id: 'error_fix_200',
    name: '🛠️ 200円 エラーキャラ削除',
    description: '不正検知のリスクとなるエラーキャラを安全に除去。',
    items: [
      { id: 'err', name: 'エラーキャラ消去', price: 200, description: 'Box内に存在するエラーキャラ（?マーク）を削除します。' },
    ]
  },
  {
    id: 'ban_guarantee_500',
    name: '🛡️ 500円 BAN保証オプション',
    description: '【超推奨】万が一のBAN時に補償を提供。安心を買うならこれ。',
    items: [
      { id: 'ban_g', name: 'BAN保証', price: 500, description: '代行後にアカウントが停止された場合の補償オプション。' }
    ]
  }
];

const ACC_ITEMS = [
  { id: 'acc_b', name: '【基本セット】初期垢', price: 400, description: '猫缶・XPカンスト済みの初期アカウント。リセマラ不要！' },
  { id: 'acc_s', name: '【最強セット】初期垢', price: 500, description: '猫缶・XP・全キャラ解放済みの最強初期アカウント。' }
];

const DAIKO_LIST = DAIKO_CATEGORIES.flatMap(category => category.items);
const ACC_LIST = ACC_ITEMS;

// スタイル定義 (Light/Darkモード対応準備)
const getStyles = (isDark: boolean) => ({
  container: {
    fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    background: isDark ? '#1a1a1a' : '#f4f6f8',
    minHeight: '100vh',
    color: isDark ? '#fff' : '#333',
    paddingBottom: '100px',
    transition: 'background 0.3s, color 0.3s',
  },
  header: {
    background: isDark ? '#2a2a2a' : '#fff',
    padding: '15px 20px',
    boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: isDark ? '#fff' : '#1a1a1a',
    margin: 0,
    cursor: 'pointer',
  },
  main: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '0 20px',
  },
  card: {
    background: isDark ? '#2a2a2a' : '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.03)',
    border: isDark ? '1px solid #333' : '1px solid #eaeaea',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: isDark ? '#333' : '#fff',
    borderRadius: '12px',
    cursor: 'pointer',
    userSelect: 'none' as const,
    border: isDark ? '1px solid #444' : '1px solid #eee',
    marginBottom: '8px',
  },
  itemContainer: {
    padding: '10px 15px',
    background: isDark ? '#222' : '#f9fafb',
    borderLeft: isDark ? '1px solid #444' : '1px solid #eee',
    borderRight: isDark ? '1px solid #444' : '1px solid #eee',
    borderBottom: isDark ? '1px solid #444' : '1px solid #eee',
    borderRadius: '0 0 12px 12px',
    marginTop: '-8px',
    marginBottom: '15px',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '8px',
    background: isDark ? '#333' : '#fff',
    borderRadius: '8px',
    border: isDark ? '1px solid #444' : '1px solid #eee',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemSelected: {
    borderColor: '#0071e3',
    background: isDark ? '#003a70' : '#f0f7ff',
  },
  searchBar: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: isDark ? '1px solid #444' : '1px solid #ddd',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    background: isDark ? '#333' : '#fff',
    color: isDark ? '#fff' : '#000',
  },
  floatingFooter: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '600px',
    background: isDark ? '#333' : '#fff',
    padding: '15px 20px',
    borderRadius: '50px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 200,
    border: isDark ? '1px solid #444' : 'none',
  },
  checkoutBtn: {
    background: '#0071e3',
    color: '#fff',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
  },
  formContainer: {
    background: isDark ? '#2a2a2a' : '#fff',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    marginTop: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: isDark ? '1px solid #444' : '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
    background: isDark ? '#333' : '#fff',
    color: isDark ? '#fff' : '#000',
  },
  userMenu: {
    position: 'absolute' as const,
    top: '60px',
    right: '20px',
    background: isDark ? '#333' : '#fff',
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
    minWidth: '180px',
    zIndex: 300,
    border: isDark ? '1px solid #444' : 'none',
  },
  menuItem: {
    padding: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    color: isDark ? '#fff' : '#333',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '5px',
  },
  dashboard: {
    background: isDark ? '#1e1e1e' : '#fff',
    borderRadius: '16px',
    padding: '20px',
    border: '2px solid #0071e3',
    textAlign: 'center' as const,
  },
});

export default function App() {
  // --- State ---
  const [view, setView] = useState<'main' | 'daiko' | 'account' | 'settings'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [discordUser, setDiscordUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]); // 注文履歴

  const [formOpen, setFormOpen] = useState(false);
  const [paypayLinkValue, setPaypayLinkValue] = useState('');
  const [paypayLinkError, setPaypayLinkError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  // Admin & Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  // UI
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const styles = getStyles(isDark);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [favorites, setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));

  // --- Functions ---

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setModalMsg("📋 コピーしました！");
    setShowModal(true);
  };

  const fetchOrderHistory = () => {
    if (discordUser) {
        // 本来は専用APIを作るべきだが、簡易的にmy-orderで最新のみ、あるいはadmin APIを改造して取得
        // ここでは最新の注文のみを表示する仕様にするか、APIを拡張する必要がある。
        // 今回は「最新の注文」を履歴として表示するに留める（要API拡張）
    }
  };

  const handleDiscordLogin = () => {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('discord_user');
    setDiscordUser(null);
    setShowUserMenu(false);
    setView('main');
    window.location.reload();
  };

  // ... (CustomModal, Admin Logic, Toggle Logic は基本的に前回と同じだが、styles適用) ...
  const CustomModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={{marginTop:0, color: '#333'}}>お知らせ</h3>
        <p style={{fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color:'#555'}}>{message}</p>
        {message.includes('Discordログイン') ? (
            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button onClick={handleDiscordLogin} style={{...styles.checkoutBtn, flex:1, background:'#5865F2'}}>🚀 ログイン</button>
                <button onClick={onClose} style={{...styles.checkoutBtn, flex:1, background:'#eee', color:'#333'}}>キャンセル</button>
            </div>
        ) : (
            <button onClick={onClose} style={{...styles.checkoutBtn, width: '100%', marginTop: '20px'}}>閉じる</button>
        )}
      </div>
    </div>
  );

  // ... (useEffect, adminAction, handleSubmit など) ...
  // ※コードが長くなりすぎるため、ロジック部分は前回のままでOK。View部分を中心に記述します。

  useEffect(() => {
    // ダークモード適用
    document.body.style.background = isDark ? '#1a1a1a' : '#f4f6f8';
  }, [isDark]);

  useEffect(() => {
    if(isAdmin && password && !isLoggedIn) refreshAdmin(password);
    
    // Auth & Load
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        window.history.replaceState({}, document.title, "/");
        fetch(`${API_BASE}/api/auth/discord`, { method: 'POST', body: JSON.stringify({ code, redirectUri: REDIRECT_URI }), headers: {'Content-Type':'application/json'} })
            .then(r=>r.json()).then(d=>{ if(d.id){ setDiscordUser(d); localStorage.setItem('discord_user', JSON.stringify(d)); }});
    } else {
        const saved = localStorage.getItem('discord_user');
        if(saved) setDiscordUser(JSON.parse(saved));
    }
  }, []);

  // 定期チェック (Active Order)
  useEffect(() => {
      if(discordUser) {
          const check = () => fetch(`${API_BASE}/api/my-order?discordId=${discordUser.id}`).then(r=>r.json()).then(d=>{ if(d.found) setActiveOrder(d.order); });
          check();
          const timer = setInterval(check, 30000);
          return () => clearInterval(timer);
      }
  }, [discordUser]);

  // --- View Components ---

  const UserMenu = () => (
    <div style={styles.userMenu}>
        <div style={{...styles.menuItem, borderBottom: isDark?'1px solid #444':'1px solid #eee', cursor:'default', fontWeight:'bold'}}>
            {discordUser.username}
        </div>
        <div onClick={()=>{setView('settings'); setShowUserMenu(false);}} style={{...styles.menuItem, ':hover':{background:'#eee'}}}>
            ⚙️ 設定・履歴
        </div>
        <div onClick={toggleTheme} style={styles.menuItem}>
            {isDark ? '☀️ ライトモード' : '🌙 ダークモード'}
        </div>
        <div onClick={handleLogout} style={{...styles.menuItem, color:'#e74c3c'}}>
            🚪 ログアウト
        </div>
    </div>
  );

  const SettingsView = () => (
    <div style={styles.main}>
        <h2 style={{color: styles.container.color}}>ユーザー設定</h2>
        <div style={styles.card}>
            <div style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
                <img src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} style={{width:'60px', borderRadius:'50%'}} />
                <div>
                    <div style={{fontSize:'18px', fontWeight:'bold'}}>{discordUser.username}</div>
                    <div style={{fontSize:'12px', color:'#777'}}>ID: {discordUser.id}</div>
                </div>
            </div>
            
            <h3>📦 注文履歴 (最新)</h3>
            {activeOrder ? (
                <div style={{background: isDark?'#333':'#f9f9f9', padding:'15px', borderRadius:'10px', fontSize:'14px'}}>
                    <div style={{fontWeight:'bold'}}>#{activeOrder.id} - {activeOrder.status}</div>
                    <div>{activeOrder.services}</div>
                    <div style={{marginTop:'5px', color:'#0071e3'}}>¥{activeOrder.totalPrice}</div>
                </div>
            ) : (
                <p>履歴はありません。</p>
            )}
        </div>
        <button onClick={()=>setView('main')} style={{...styles.checkoutBtn, background:'#777', width:'100%'}}>戻る</button>
    </div>
  );

  // ... (StatusDashboard, AdminView は前回と同じ) ...
  const StatusDashboard = ({ order }: { order: any }) => (
    <div style={styles.dashboard}>
        <h3 style={{color:'#0071e3', marginTop:0}}>
            {order.status === 'completed' ? '✅ 作業完了' : '⏳ 作業中 / 待機中'}
        </h3>
        {/* ... (中身は前回と同じ) ... */}
        {order.status !== 'completed' && (
            <div style={{marginBottom:'20px'}}>
                <p style={{fontSize:'14px', lineHeight:'1.6'}}>
                    現在作業中です。<br/>
                    完了通知が届かない場合は、以下のサーバーでチケットを作成し、<br/>
                    注文番号 <strong>#{order.id}</strong> を添えてご連絡ください。<br/>
                    (最低でも24時間は完了までお待ちください)
                </p>
                <a href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer" style={{...styles.checkoutBtn, background:'#5865F2', textDecoration:'none', display:'inline-block', fontSize:'14px'}}>
                    👾 サポートサーバー
                </a>
            </div>
        )}
        {/* ... */}
    </div>
  );

  // --- Main Render ---
  
  if(isAdmin) { /* ... (Admin画面は前回と同じ) ... */ return null; } // 簡略化のため省略

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 onClick={()=>{setView('main'); setFormOpen(false);}} style={styles.headerTitle}>WEI STORE 🐾</h1>
        
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            {!discordUser && (
                <button onClick={toggleTheme} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}>
                    {isDark ? '☀️' : '🌙'}
                </button>
            )}
            
            {discordUser ? (
                <div style={{position:'relative'}}>
                    <img 
                        src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} 
                        alt="User" 
                        style={{width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #eee'}}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    />
                    {showUserMenu && <UserMenu />}
                </div>
            ) : (
                <button onClick={handleDiscordLogin} style={{background:'#5865F2', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'20px', fontSize:'13px', fontWeight:'bold', cursor:'pointer'}}>Discord Login</button>
            )}
        </div>
      </header>

      <main style={styles.main}>
        {view === 'settings' && discordUser ? (
            <SettingsView />
        ) : activeOrder && activeOrder.status !== 'scrubbed' && view === 'main' && !formOpen ? (
            <StatusDashboard order={activeOrder} />
        ) : formOpen ? (
            // 注文フォーム (前回と同じだがスタイル適用)
            <div ref={formRef} style={styles.formContainer}>
                {/* ... (フォーム内容は前回と同じ) ... */}
            </div>
        ) : (
            // 商品リスト画面
            <div>
                {/* 検索バー */}
                <input type="text" placeholder="🔍 商品を検索..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={styles.searchBar} />
                
                {/* カテゴリ表示 */}
                {(view === 'daiko' ? filteredCategories : [{id:'acc', name:'🎁 アカウント販売', items:ACC_ITEMS}]).map(cat => (
                    <div key={cat.id}>
                        <div onClick={() => toggleCategory(cat.id)} style={styles.categoryHeader}>
                            <div>
                                <div style={{fontWeight:'bold', fontSize:'16px', color: isDark?'#fff':'#333'}}>{cat.name}</div>
                                {cat.description && <div style={{fontSize:'12px', color:'#888'}}>{cat.description}</div>}
                            </div>
                            <div style={{color: isDark?'#fff':'#333'}}>{expandedCategories.includes(cat.id) ? '▲' : '▼'}</div>
                        </div>
                        
                        {expandedCategories.includes(cat.id) && (
                            <div style={styles.itemContainer}>
                                <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}}>
                                    <button onClick={()=>toggleCategoryItems(cat.items)} style={{fontSize:'11px', padding:'5px 10px', border:'1px solid #888', borderRadius:'15px', background:'transparent', color: isDark?'#fff':'#333', cursor:'pointer'}}>全選択</button>
                                </div>
                                {cat.items.map(item => (
                                    <div key={item.id} onClick={() => toggleItem(item.id)} style={{...styles.item, ...(selected.includes(item.id) ? styles.itemSelected : {})}}>
                                        <div style={{flex:1}}>
                                            <div style={{fontWeight:'bold', fontSize:'14px', color: isDark?'#fff':'#333'}}>
                                                {item.name}
                                                <span onClick={(e)=>toggleFavorite(item.id, e)} style={{marginLeft:'8px', cursor:'pointer', color: favorites.includes(item.id) ? '#ffd700' : '#ccc'}}>★</span>
                                            </div>
                                            <div style={{fontSize:'11px', color:'#888'}}>{item.description}</div>
                                        </div>
                                        <div style={{...styles.itemPrice, color:'#0071e3'}}>¥{item.price}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* フッター */}
      {!formOpen && !activeOrder && selected.length > 0 && view !== 'settings' && (
        <div style={styles.floatingFooter}>
          <div style={{fontWeight:'bold', fontSize:'16px', color: isDark?'#fff':'#333'}}>
            {selected.length}点 <span style={{color:'#0071e3', marginLeft:'5px'}}>¥{totalSelectedPrice}</span>
          </div>
          <button onClick={() => setFormOpen(true)} style={styles.checkoutBtn}>手続きへ</button>
        </div>
      )}

      {showModal && <CustomModal message={modalMsg} onClose={() => { setShowModal(false); if(modalMsg.includes('注文を受け付け')) window.location.reload(); }} />}
    </div>
  );
}
