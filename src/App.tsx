import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev";
const DISCORD_CLIENT_ID = "1456569335190388951"; 
const REDIRECT_URI = "https://kenji123.f5.si/"; 
const SUPPORT_SERVER_URL = "https://discord.gg/YOUR_INVITE_CODE"; 

// 商品データ (前回と同じ)
const DAIKO_CATEGORIES = [
  {
    id: 'basic_services_80',
    name: '💰 80円 基本強化パック',
    description: 'ゲーム進行の基礎となる必須アイテムをお得に強化。',
    items: [
      { id: 'neko', name: '猫缶カンスト', price: 80, description: '猫缶を最大値（約99999）まで増加。' },
      { id: 'xp', name: 'XPカンスト', price: 80, description: 'XPを最大値（約99999999）まで増加。' },
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

// スタイル定義 (Light/Darkモード対応)
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
  itemPrice: {
    fontWeight: 'bold',
    color: '#0071e3',
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
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: isDark ? '#ccc' : '#555',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  errorMsg: {
    color: '#e74c3c',
    fontSize: '13px',
    marginTop: '5px',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  },
  modalContent: {
    background: '#fff',
    padding: '30px',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '400px',
    textAlign: 'center' as const,
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
});

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account' | 'settings'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [discordUser, setDiscordUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));

  const [formOpen, setFormOpen] = useState(false);
  const [paypayLinkValue, setPaypayLinkValue] = useState('');
  const [paypayLinkError, setPaypayLinkError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const styles = getStyles(isDark);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

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

  const CustomModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={{marginTop:0, color:'#333'}}>お知らせ</h3>
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

  const checkLogin = () => {
    if (!discordUser) {
      setModalMsg("⚠️ 商品を選択するにはDiscordログインが必要です。\n\nログインして続行しますか？");
      setShowModal(true);
      return false;
    }
    return true;
  };

  const toggleItem = (id: string) => {
    if (!checkLogin()) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };
  
  const toggleCategoryItems = (catItems: any[]) => {
    if (!checkLogin()) return;
    setSelected(prev => [...new Set([...prev, ...catItems.map(i=>i.id)])]);
  };
  
  const toggleCategory = (id: string) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const toggleAll = (select: boolean) => {
    if (select && !checkLogin()) return;
    if(select) {
      setSelected(allItemsFlat.map(x=>x.id));
      setExpandedCategories(DAIKO_CATEGORIES.map(x=>x.id));
    } else {
      setSelected([]);
      setExpandedCategories([]);
    }
  };

  const openForm = () => {
    setFormOpen(true);
    setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  useEffect(() => {
    document.body.style.background = isDark ? '#1a1a1a' : '#f4f6f8';
  }, [isDark]);

  useEffect(() => {
    if (isAdmin && password && !isLoggedIn) {
      setTimeout(() => refreshAdmin(password), 500);
    }

    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      window.history.replaceState({}, document.title, "/");
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
      const saved = localStorage.getItem('discord_user');
      if (saved) setDiscordUser(JSON.parse(saved));
    }
  }, [isAdmin]);

  const refreshAdmin = async (pw: string) => {
      try {
          const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': pw } });
          if (res.ok) {
              const d = await res.json();
              setData(d);
              setIsLoggedIn(true);
              localStorage.setItem('admin_pw', pw);
          } else {
              throw new Error("Auth failed");
          }
      } catch (e) {
          setIsLoggedIn(false);
      }
  };
  
  const adminAction = (id: any, action: string, extra = {}) => {
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(() => refreshAdmin(password));
  };

  useEffect(() => {
      if(discordUser) {
          const check = () => fetch(`${API_BASE}/api/my-order?discordId=${discordUser.id}`).then(r=>r.json()).then(d=>{ if(d.found) setActiveOrder(d.order); });
          check();
          const timer = setInterval(check, 30000);
          return () => clearInterval(timer);
      }
  }, [discordUser]);

  const allItemsFlat = useMemo(() => [...DAIKO_LIST, ...ACC_LIST], []);
  const totalSelectedPrice = useMemo(() => selected.reduce((sum, id) => sum + (allItemsFlat.find(p=>p.id===id)?.price || 0), 0), [selected, allItemsFlat]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return DAIKO_CATEGORIES;
    return DAIKO_CATEGORIES.map(c => ({
      ...c, items: c.items.filter(i => i.name.includes(searchTerm) || i.description.includes(searchTerm))
    })).filter(c => c.items.length > 0);
  }, [searchTerm]);

  const handlePaypay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaypayLinkValue(val);
    setPaypayLinkError(val && /paypay\.ne\.jp/.test(val) ? null : 'PayPayのリンクを含めてください');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (paypayLinkError) return;
    
    if (!discordUser) {
        setModalMsg("⚠️ 注文にはDiscordログインが必要です。");
        setShowModal(true);
        return;
    }
    
    const fd = new FormData(e.currentTarget);
    const order = {
      username: discordUser.username,
      discordUserId: discordUser.id,
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
      setTimeout(() => {
          fetch(`${API_BASE}/api/my-order?discordId=${discordUser.id}`)
                .then(r => r.json())
                .then(d => { if(d.found) setActiveOrder(d.order); });
      }, 1000);
    } catch (err) {
      setModalMsg("❌ 送信エラーが発生しました。");
      setShowModal(true);
    }
  };

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
                <img src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} style={{width:'60px', borderRadius:'50%'}} alt="Avatar"/>
                <div>
                    <div style={{fontSize:'18px', fontWeight:'bold', color: styles.container.color}}>{discordUser.username}</div>
                    <div style={{fontSize:'12px', color:'#777'}}>ID: {discordUser.id}</div>
                </div>
            </div>
            
            <h3 style={{color: styles.container.color}}>📦 注文履歴 (最新)</h3>
            {activeOrder ? (
                <div style={{background: isDark?'#333':'#f9f9f9', padding:'15px', borderRadius:'10px', fontSize:'14px', color: styles.container.color}}>
                    <div style={{fontWeight:'bold'}}>#{activeOrder.id} - {activeOrder.status === 'completed' ? '完了' : '進行中'}</div>
                    <div>{activeOrder.services}</div>
                    <div style={{marginTop:'5px', color:'#0071e3'}}>¥{activeOrder.totalPrice}</div>
                </div>
            ) : (
                <p style={{color: styles.container.color}}>履歴はありません。</p>
            )}
        </div>
        <button onClick={()=>setView('main')} style={{...styles.checkoutBtn, background:'#777', width:'100%'}}>戻る</button>
    </div>
  );

  const StatusDashboard = ({ order }: { order: any }) => (
    <div style={{...styles.card, border: '2px solid #0071e3', background: isDark?'#222':'#f0f7ff', textAlign:'center'}}>
        <h3 style={{color:'#0071e3', marginTop:0, fontSize:'20px'}}>
            {order.status === 'completed' ? '✅ 作業完了' : '⏳ 作業中 / 待機中'}
        </h3>
        
        <div style={{marginBottom:'20px', padding:'15px', background: isDark?'#333':'#fff', borderRadius:'10px', display:'inline-block', minWidth:'250px'}}>
            <div style={{fontSize:'12px', color:'#777', marginBottom:'5px'}}>注文番号: #{order.id}</div>
            <div style={{fontSize:'16px', fontWeight:'bold', color: isDark?'#fff':'#333'}}>{order.services}</div>
            <div style={{fontSize:'14px', color:'#0071e3', marginTop:'5px'}}>¥{order.totalPrice}</div>
        </div>

        {order.status !== 'completed' && (
            <div style={{marginBottom:'20px'}}>
                <p style={{fontSize:'14px', lineHeight:'1.6', fontWeight:'bold', color: isDark?'#ccc':'#333'}}>
                    現在作業中です。完了までしばらくお待ちください。<br/>
                    (通常、数分〜数時間で完了します)
                </p>
                <div style={{background: isDark?'#333':'#fff', padding:'15px', borderRadius:'10px', fontSize:'13px', color: isDark?'#ccc':'#555', textAlign:'left', border: isDark?'1px solid #444':'1px solid #ddd'}}>
                    <strong>⚠️ 重要なお知らせ</strong><br/>
                    完了通知はDiscordのDMで送信されます。<br/>
                    もし通知が届かない場合や、24時間経過しても完了しない場合は、以下のサポートサーバーでチケットを作成し、注文番号 <strong>#{order.id}</strong> を添えてご連絡ください。
                </div>
                <a href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer" style={{...styles.checkoutBtn, display:'inline-block', textDecoration:'none', fontSize:'14px', background:'#5865F2', marginTop:'15px', width:'100%', boxSizing:'border-box'}}>
                    👾 サポートサーバーに参加する
                </a>
            </div>
        )}

        {order.status === 'completed' && (
            <div>
                <p style={{fontWeight:'bold', fontSize:'16px', color: isDark?'#fff':'#333'}}>作業が完了しました！</p>
                <p style={{fontSize:'14px', color: isDark?'#ccc':'#555'}}>ゲームにログインして内容をご確認ください。</p>
                
                {order.proofImageUrl ? (
                    <div style={{margin:'20px 0'}}>
                        <img src={order.proofImageUrl} alt="完了証拠" style={{maxWidth:'100%', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.1)', border:'1px solid #ddd'}} />
                        <div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>完了スクリーンショット</div>
                    </div>
                ) : (
                    <div style={{margin:'20px 0', padding:'15px', background: isDark?'#333':'#eee', borderRadius:'10px', fontSize:'12px', color: isDark?'#ccc':'#555'}}>
                        (完了画像が表示されない場合は、Discordをご確認ください)
                    </div>
                )}
                
                <button onClick={() => setActiveOrder(null)} style={{...styles.checkoutBtn, background:'#333', fontSize:'14px', marginTop:'10px'}}>
                    新しい注文をする
                </button>
            </div>
        )}
    </div>
  );

  // --- Render ---

  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#111', color:'#fff'}}>
        <h1>WEI ADMIN</h1>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'10px', borderRadius:'5px', border:'none', marginBottom:'10px', fontSize:'16px'}} placeholder="Password" />
        <button onClick={() => refreshAdmin(password)} style={styles.checkoutBtn}>LOGIN</button>
      </div>
    );
    return (
      <div style={styles.adminContainer}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2>魏 司令官：管理画面</h2>
          <button onClick={()=>{setIsLoggedIn(false); localStorage.removeItem('admin_pw'); setPassword(''); setData(null);}} style={{background:'#e74c3c', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Logout</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#222', border:'1px solid #444', padding:'15px', borderRadius:'10px', position:'relative'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <span style={{background:'#0071e3', padding:'2px 8px', borderRadius:'4px', fontSize:'12px'}}>#{o.id}</span>
                <strong>{o.username}</strong>
                <span style={{color:'#4af', fontWeight:'bold'}}>¥{o.totalPrice}</span>
              </div>
              <div style={{fontSize:'12px', color:'#aaa', marginBottom:'5px'}}>
                <div>📅 {new Date(o.createdAt || Date.now()).toLocaleString()}</div>
                <div>🔒 IP: <span style={{color:'#ff4444'}}>{o.ipAddress}</span></div>
                <div>🆔 Device: {o.browserId}</div>
              </div>
              <div style={{background:'#000', padding:'10px', borderRadius:'5px', fontFamily:'monospace', fontSize:'12px', wordBreak:'break-all', marginBottom:'10px'}}>
                <div style={{color:'#888'}}>引き継ぎ情報:</div>
                ID: <span style={{color:'#fff', fontWeight:'bold'}}>{o.transferCode}</span><br/>
                PW: <span style={{color:'#fff', fontWeight:'bold'}}>{o.authPassword}</span>
              </div>
              <div style={{fontSize:'12px', marginBottom:'10px', padding:'5px', background:'rgba(255,255,255,0.05)', borderRadius:'5px'}}>
                <strong>注文内容:</strong><br/>
                {o.services}
              </div>
              <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>adminAction(o.id, 'complete', {image: e.target.files![0], userId: o.userId})} />
                <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#28a745', color:'#fff', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer'}}>✅ 完了通知</button>
                <button onClick={()=>adminAction(o.id, 'scrub')} style={{flex:1, background:'#555', border:'none', color:'#fff', borderRadius:'5px', padding:'8px', cursor:'pointer'}}>🗑️ 抹消</button>
                <a href={o.paypayUrl} target="_blank" rel="noreferrer" style={{flex:1, background:'#fff', color:'#000', textDecoration:'none', padding:'8px', borderRadius:'5px', fontSize:'12px', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center'}}>PayPay確認</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
        ) : view === 'main' && !formOpen ? (
          <>
            {/* メインメニュー */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'30px'}}>
              <div onClick={() => setView('daiko')} style={styles.card}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>🎮</div>
                <div style={{fontWeight:'bold', fontSize:'18px', color: isDark?'#fff':'#333'}}>代行サービス</div>
                <div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>最強のデータを作成</div>
              </div>
              <div onClick={() => setView('account')} style={styles.card}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>🎁</div>
                <div style={{fontWeight:'bold', fontSize:'18px', color: isDark?'#fff':'#333'}}>アカウント販売</div>
                <div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>即座にスタート</div>
              </div>
            </div>
            
            <div style={{...styles.card, background: isDark?'#333':'#fff9c4', border: isDark?'1px solid #555':'1px solid #fbc02d'}}>
              <h3 style={{margin:'0 0 10px 0', fontSize:'16px', color: isDark?'#fff':'#333'}}>📢 お知らせ</h3>
              <p style={{margin:0, fontSize:'14px', color: isDark?'#ccc':'#333'}}>
                現在、全ての代行メニューが通常通りご利用いただけます。<br/>
                BAN保証オプションの加入を強く推奨しております。
              </p>
            </div>
          </>
        ) : formOpen ? (
            // 注文フォーム
            <div ref={formRef} style={styles.formContainer}>
                <h2 style={{textAlign:'center', marginBottom:'20px', color: styles.container.color}}>注文情報の入力</h2>
                <form onSubmit={handleSubmit}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>お名前</label>
                    <input value={discordUser.username} disabled style={{...styles.input, background:'#eee', color:'#555'}} />
                  </div>
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
            </div>
        ) : (
            // 商品リスト
            <div>
                <div style={{marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <button onClick={() => { setView('main'); setFormOpen(false); }} style={{background:'none', border:'none', color:'#0071e3', fontSize:'16px', cursor:'pointer'}}>← 戻る</button>
                    <h2 style={{margin:0, fontSize:'20px', color: isDark?'#fff':'#333'}}>{view === 'daiko' ? '代行メニュー' : 'アカウント販売'}</h2>
                </div>

                <input type="text" placeholder="🔍 商品を検索..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={styles.searchBar} />
                
                <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                  <button onClick={()=>toggleAll(true)} style={{...styles.checkoutBtn, padding:'8px 15px', fontSize:'12px', background: isDark?'#444':'#eee', color: isDark?'#fff':'#333'}}>全て選択</button>
                  <button onClick={()=>toggleAll(false)} style={{...styles.checkoutBtn, padding:'8px 15px', fontSize:'12px', background: isDark?'#444':'#eee', color: isDark?'#fff':'#333'}}>全て解除</button>
                </div>

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

      {!formOpen && !activeOrder && selected.length > 0 && view !== 'settings' && (
        <div style={styles.floatingFooter}>
          <div style={{fontWeight:'bold', fontSize:'16px', color: isDark?'#fff':'#333'}}>
            {selected.length}点 <span style={{color:'#0071e3', marginLeft:'5px'}}>¥{totalSelectedPrice}</span>
          </div>
          <button onClick={openForm} style={styles.checkoutBtn}>手続きへ</button>
        </div>
      )}

      {showModal && <CustomModal message={modalMsg} onClose={() => { setShowModal(false); if(modalMsg.includes('注文を受け付け')) window.location.reload(); }} />}
    </div>
  );
}
