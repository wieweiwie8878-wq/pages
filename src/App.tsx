import React, { useState, useEffect, useMemo, useRef } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // WorkersのURL

// Discord設定
const DISCORD_CLIENT_ID = "1456569335190388951"; 
const REDIRECT_URI = "https://kenji123.f5.si/"; 
const SUPPORT_SERVER_URL = "https://discord.gg/t68XQeTtx8"; // ★ここに実際の招待コードを入れてください

// デバッグモード切り替え
const DEBUG_MODE = true; // ★ デバッグ情報を表示する場合はtrue, 本番環境ではfalseに設定

// 商品データの定義
const DAIKO_CATEGORIES = [
  {
    id: 'basic_services_80',
    name: '💰 80円 基本強化パック',
    description: 'ゲーム進行の基礎となる必須アイテムをお得に強化。',
    items: [
      { id: 'neko', name: '猫缶カンスト', price: 80, description: '猫缶を最大値（約99999）まで増加。' },
      { id: 'xp', name: 'XPカンスト', price: 80, description: 'XPを最大値（約99999999）まで増加。' },
      { id: 't_norm', price: 80, description: '通常チケットを上限の100枚まで付与。' },
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

// スタイル定義
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
    border: isDark ? '#1a1a1a' : '1px solid #ddd',
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
  adminContainer: {
    background: '#121212',
    color: '#e0e0e0',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'monospace',
  },
  adminCard: {
    background: '#1e1e1e',
    border: '1px solid #333',
    padding: '15px',
    borderRadius: '10px',
    position: 'relative' as const,
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  debugOverlay: {
    position: 'fixed' as const,
    bottom: '0',
    left: '0',
    width: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#0f0',
    fontSize: '10px',
    maxHeight: '20vh',
    overflowY: 'scroll' as const,
    padding: '5px',
    zIndex: 9999,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
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
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('favorites') || '[]'));
  
  const [disabledItems, setDisabledItems] = useState<string[]>([]);
  const [adminView, setAdminView] = useState<'orders' | 'config'>('orders');

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
  
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [debugInfo, setDebugInfo] = useState<string[]>([]); // デバッグ情報保存用

  // デバッグログ追加関数
  const addDebugLog = (message: string, obj?: any) => {
    if (!DEBUG_MODE) return;
    const timestamp = new Date().toISOString().substring(11, 23);
    let logMsg = `[${timestamp}] ${message}`;
    if (obj) {
      try { logMsg += `\n${JSON.stringify(obj, null, 2)}`; } catch { logMsg += `\n${String(obj)}`; }
    }
    setDebugInfo(prev => [logMsg, ...prev.slice(0, 9)]); // 最新10件保持
    console.log(logMsg, obj || '');
  };


  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    addDebugLog(`Theme toggled to ${newTheme ? 'dark' : 'light'}`);
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    addDebugLog(`Item ${id} favorite toggled. New favorites:`, newFavs);
  };

  const handleDiscordLogin = () => {
    addDebugLog("Initiating Discord login...");
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify',
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
  };

  const handleLogout = () => {
    addDebugLog("Logging out Discord user...");
    localStorage.removeItem('discord_user');
    setDiscordUser(null);
    setShowUserMenu(false);
    setView('main');
    window.location.reload();
  };

  const fetchHistory = () => {
      if(discordUser) {
          addDebugLog("Fetching order history for Discord user:", discordUser.id);
          fetch(`${API_BASE}/api/my-history?discordId=${discordUser.id}`)
            .then(r=>r.json())
            .then(d=>{ 
                addDebugLog("Order history fetched:", d);
                if(d.history) setOrderHistory(d.history); 
            }).catch(e => addDebugLog("Error fetching history:", e));
      }
  };

  // 設定読み込み
  useEffect(() => {
      addDebugLog("Fetching disabled items config...");
      fetch(`${API_BASE}/api/config`).then(r=>r.json()).then(d => {
          addDebugLog("Disabled items config fetched:", d);
          if(d.disabledItems) setDisabledItems(d.disabledItems);
      }).catch(e => addDebugLog("Error fetching config:", e));
  }, []);

  const postReview = async () => {
    if (!activeOrder || !reviewContent || !discordUser) {
      addDebugLog("Review post failed: missing data.");
      return;
    }
    addDebugLog("Posting review...", { orderId: activeOrder.id, content: reviewContent, discordId: discordUser.id });
    try {
        const res = await fetch(`${API_BASE}/api/post-review`, {
            method: 'POST',
            body: JSON.stringify({ 
                orderId: activeOrder.id, 
                content: reviewContent,
                discordId: discordUser.id,
                username: discordUser.username
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const resData = await res.json();
        addDebugLog("Review post API response:", resData);
        if (resData.success) {
            setModalMsg("✅ 実績を送信しました！ご協力ありがとうございます。");
            setShowModal(true);
            setShowReviewModal(false);
        } else {
            setModalMsg("❌ 送信に失敗しました: " + (resData.error || '不明なエラー'));
            setShowModal(true);
        }
    } catch (e: any) {
        addDebugLog("Review post fetch error:", e);
        setModalMsg("❌ 送信に失敗しました。");
        setShowModal(true);
    }
  };
  
  const toggleProductConfig = async (id: string) => {
    const newDisabled = disabledItems.includes(id) 
        ? disabledItems.filter(i => i !== id) 
        : [...disabledItems, id];
    setDisabledItems(newDisabled);
    addDebugLog("Toggling product config for item:", { id, newDisabled });
    
    try {
        const res = await fetch(`${API_BASE}/api/admin/config`, {
            method: 'POST',
            body: JSON.stringify({ disabledItems: newDisabled }),
            headers: { 'Content-Type': 'application/json', 'Authorization': password }
        });
        const resData = await res.json();
        addDebugLog("Admin config update API response:", resData);
        if (!resData.success) {
            setModalMsg("❌ 商品設定の更新に失敗しました: " + (resData.error || '不明なエラー'));
            setShowModal(true);
        }
    } catch (e: any) {
        addDebugLog("Admin config update fetch error:", e);
        setModalMsg("❌ 商品設定の更新に失敗しました。");
        setShowModal(true);
    }
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
  
  const ReviewModal = () => (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <h3 style={{color: '#333'}}>実績を投稿</h3>
            <textarea 
                value={reviewContent}
                onChange={e => setReviewContent(e.target.value)}
                placeholder="サービス内容や感想をご記入ください..."
                style={{width:'100%', height:'100px', padding:'10px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'15px', boxSizing:'border-box', fontFamily:'sans-serif'}}
            />
            <button onClick={postReview} style={{...styles.checkoutBtn, width:'100%'}}>送信する</button>
            <button onClick={() => setShowReviewModal(false)} style={{width:'100%', background:'none', border:'none', color:'#777', marginTop:'10px', cursor:'pointer'}}>キャンセル</button>
        </div>
    </div>
  );

  const StatusDashboard = ({ order }: { order: any }) => {
    const isCompleted = order.status === 'completed';
    const isInProgress = order.status === 'in_progress';
    const isScrubbed = order.status === 'scrubbed';
    const orderToken = `${order.id}-${order.discordUserId?.substring(0, 5) || 'xxxx'}`;

    return (
        <div style={{...styles.main, maxWidth:'600px', marginTop:'40px'}}>
            <div style={{textAlign:'center', marginBottom:'30px'}}>
                <div style={{fontSize:'60px', marginBottom:'10px'}}>
                    {isCompleted ? '🎉' : isScrubbed ? '🗑️' : isInProgress ? '🔄' : '⏳'}
                </div>
                <h2 style={{fontSize:'24px', margin:0, color: isDark?'#fff':'#333'}}>
                    {isCompleted ? '作業が完了しました！' : isScrubbed ? 'データ抹消済み' : isInProgress ? '作業中です' : '注文を受け付けました'}
                </h2>
                <p style={{color:'#888', marginTop:'5px'}}>
                    {isCompleted ? 'ご利用ありがとうございました。' : isInProgress ? '完了までお待ちください。' : '担当者が作業を開始します。'}
                </p>
            </div>

            <div style={{...styles.card, border: `2px solid ${isCompleted ? '#4caf50' : isInProgress ? '#fbc02d' : '#0071e3'}`, background: isDark?'#222':'#fff'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: isDark?'1px solid #444':'1px solid #eee', paddingBottom:'15px', marginBottom:'15px'}}>
                    <span style={{fontSize:'14px', color:'#888'}}>注文番号</span>
                    <span style={{fontSize:'18px', fontWeight:'bold', color: isDark?'#fff':'#333'}}>#{order.id}</span>
                </div>
                
                <div style={{marginBottom:'20px'}}>
                    <div style={{fontSize:'14px', color:'#888', marginBottom:'5px'}}>注文内容</div>
                    <div style={{fontSize:'16px', fontWeight:'bold', color: isDark?'#fff':'#333', lineHeight:'1.5'}}>
                        {order.services.split(',').map((s: string, i: number) => (
                            <div key={i}>・{s}</div>
                        ))}
                    </div>
                </div>

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'15px', borderTop: isDark?'1px solid #444':'1px solid #eee'}}>
                    <span style={{fontSize:'14px', color:'#888'}}>合計金額</span>
                    <span style={{fontSize:'24px', fontWeight:'bold', color:'#0071e3'}}>¥{order.totalPrice}</span>
                </div>
            </div>

            <div style={{background: isDark?'#333':'#f0f0f0', padding:'15px', borderRadius:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                <div>
                    <div style={{fontSize:'11px', color:'#888', fontWeight:'bold'}}>YOUR ORDER TOKEN</div>
                    <div style={{fontSize:'14px', fontFamily:'monospace', color: isDark?'#fff':'#333'}}>{orderToken}</div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(orderToken); setModalMsg("📋 コピーしました"); setShowModal(true); }} style={{background:'none', border:'none', color:'#0071e3', fontWeight:'bold', cursor:'pointer'}}>コピー</button>
            </div>

            {!isCompleted && !isScrubbed && (
                <div style={{marginBottom:'30px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#888', marginBottom:'5px'}}>
                        <span>受付済み</span>
                        <span style={{color: isInProgress ? '#fbc02d' : '#888'}}>作業中</span>
                        <span>完了</span>
                    </div>
                    <div style={{height:'6px', background:'#eee', borderRadius:'3px', position:'relative', overflow:'hidden'}}>
                        <div style={{position:'absolute', left:0, top:0, bottom:0, width: isInProgress ? '66%' : '33%', background: isInProgress ? '#fbc02d' : '#0071e3', borderRadius:'3px', transition:'width 0.5s'}}></div>
                        <div style={{position:'absolute', left:0, top:0, bottom:0, width:'30%', background:'rgba(255,255,255,0.5)', animation:'loading 1.5s infinite'}}></div>
                    </div>
                    <style>{`@keyframes loading { 0% { left: 0; } 100% { left: 100%; } }`}</style>
                    <div style={{marginTop:'20px', textAlign:'center'}}>
                        <p style={{fontSize:'13px', color:'#888'}}>
                            完了通知を受け取るには、サポートサーバーへの参加が必要です。<br/>
                            (未参加の場合、BotからのDMが届きません)
                        </p>
                        <a href={SUPPORT_SERVER_URL} target="_blank" rel="noreferrer" style={{...styles.checkoutBtn, display:'inline-block', textDecoration:'none', fontSize:'14px', background:'#5865F2', marginTop:'10px', width:'100%', boxSizing:'border-box'}}>
                            👾 サポートサーバーに参加する
                        </a>
                    </div>
                </div>
            )}

            {isCompleted && (
                <div style={{textAlign:'center'}}>
                    {order.proofImageUrl && (
                        <div style={{marginBottom:'20px'}}>
                            <img src={order.proofImageUrl} alt="完了証拠" style={{maxWidth:'100%', borderRadius:'10px', boxShadow:'0 5px 15px rgba(0,0,0,0.2)'}} />
                            <div style={{fontSize:'12px', color:'#888', marginTop:'5px'}}>完了スクリーンショット</div>
                        </div>
                    )}
                    
                    <button onClick={() => setShowReviewModal(true)} style={{...styles.checkoutBtn, background:'#fbc02d', color:'#000', marginBottom:'10px', width:'100%'}}>
                        ✍️ 実績を投稿する
                    </button>

                    <button onClick={() => setActiveOrder(null)} style={{...styles.checkoutBtn, background:'#333', padding:'15px 40px'}}>新しい注文をする</button>
                </div>
            )}
            
            <button onClick={() => { setActiveOrder(null); setView('main'); }} style={{width:'100%', background:'none', border:'none', color: isDark?'#aaa':'#555', marginTop:'20px', cursor:'pointer'}}>← メニューに戻る</button>
        </div>
    );
  };

  const checkLogin = () => {
    if (!discordUser) {
      setModalMsg("⚠️ 商品を選択するにはDiscordログインが必要です。\n\nログインして続行しますか？");
      setShowModal(true);
      return false;
    }
    return true;
  };

  const toggleItem = (id: string) => { if (!checkLogin()) return; setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]); };
  const toggleCategoryItems = (catItems: any[]) => { if (!checkLogin()) return; setSelected(prev => [...new Set([...prev, ...catItems.map(i=>i.id)])]); };
  const toggleCategory = (id: string) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const toggleAll = (select: boolean) => {
    if (select && !checkLogin()) return;
    if(select) { setSelected(allItemsFlat.map(x=>x.id)); setExpandedCategories(DAIKO_CATEGORIES.map(x=>x.id)); }
    else { setSelected([]); setExpandedCategories([]); }
  };
  const openForm = () => { setFormOpen(true); setTimeout(() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (paypayLinkError) return;
    if (!discordUser) { setModalMsg("⚠️ 注文にはDiscordログインが必要です。"); setShowModal(true); return; }
    
    const fd = new FormData(e.currentTarget);
    const order = { username: discordUser.username, discordUserId: discordUser.id, tc: fd.get('tc'), ap: fd.get('ap'), paypayUrl: paypayLinkValue,
      services: allItemsFlat.filter(p=>selected.includes(p.id)).map(p=>p.name).join(','), total: totalSelectedPrice,
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36).substring(2, 15) };
    try {
      addDebugLog("Submitting order:", order);
      const res = await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
      const resData = await res.json();
      addDebugLog("Order submission API response:", resData);
      if (resData.success) {
          setFormOpen(false); setSelected([]); setView('main');
          const newOrder = { id: resData.orderId, status: 'pending', services: order.services, totalPrice: order.total, proofImageUrl: null, discordUserId: discordUser.id };
          setActiveOrder(newOrder); window.scrollTo({ top: 0, behavior: 'smooth' });
          setModalMsg("✅ 注文を受け付けました！\n完了時にBotからDMが届きます。"); setShowModal(true);
      } else { setModalMsg("❌ サーバーエラー: " + resData.error); setShowModal(true); }
    } catch (err: any) { addDebugLog("Order submission fetch error:", err); setModalMsg("❌ 送信エラーが発生しました。"); setShowModal(true); }
  };

  const refreshAdmin = async (pw: string) => {
      try {
          addDebugLog("Refreshing admin stats...");
          const res = await fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': pw } });
          if (res.ok) { const d = await res.json(); setData(d); setIsLoggedIn(true); localStorage.setItem('admin_pw', pw); addDebugLog("Admin stats fetched:", d); }
          else { throw new Error("Auth failed"); }
      } catch (e: any) { addDebugLog("Error refreshing admin stats:", e); setIsLoggedIn(false); }
  };
  
  const adminAction = (id: any, action: string, extra = {}) => {
    addDebugLog("Performing admin action:", { id, action, extra });
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(() => refreshAdmin(password));
  };

  const handlePaypay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setPaypayLinkValue(val);
    setPaypayLinkError(val && /paypay\.ne\.jp/.test(val) ? null : 'PayPayのリンクを含めてください');
  };

  // --- Effects ---
  useEffect(() => { document.body.style.background = isDark ? '#1a1a1a' : '#f4f6f8'; }, [isDark]);
  useEffect(() => {
    if (isAdmin && password && !isLoggedIn) { setTimeout(() => refreshAdmin(password), 500); }
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      addDebugLog("Discord OAuth code detected. Exchanging token...");
      window.history.replaceState({}, document.title, "/");
      fetch(`${API_BASE}/api/auth/discord`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, redirectUri: REDIRECT_URI }), })
      .then(res => res.json()).then(data => {
        addDebugLog("Discord OAuth API response:", data);
        if (data.id) { setDiscordUser(data); localStorage.setItem('discord_user', JSON.stringify(data)); setModalMsg(`ようこそ、${data.username}さん！\nログインしました。`); setShowModal(true); }
        else { setModalMsg("ログインに失敗しました。"); setShowModal(true); }
      }).catch(err => addDebugLog("Discord OAuth fetch error:", err));
    } else { const saved = localStorage.getItem('discord_user'); if (saved) setDiscordUser(JSON.parse(saved)); }
  }, [isAdmin]);
  useEffect(() => {
      if(discordUser) {
          addDebugLog("Starting active order check for Discord user:", discordUser.id);
          const check = () => fetch(`${API_BASE}/api/my-order?discordId=${discordUser.id}`).then(r=>r.json()).then(d=>{ if(d.found) setActiveOrder(d.order); addDebugLog("Active order check response:", d); });
          check(); const timer = setInterval(check, 30000); return () => clearInterval(timer);
      }
  }, [discordUser]);

  // --- Render (Admin) ---
  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#121212', color:'#fff'}}>
        <h1>WEI ADMIN</h1>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'10px', borderRadius:'5px', border:'none', marginBottom:'10px', fontSize:'16px', background:'#333', color:'#fff'}} placeholder="Password" />
        <button onClick={() => refreshAdmin(password)} style={styles.checkoutBtn}>LOGIN</button>
      </div>
    );
    return (
      <div style={styles.adminContainer}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2 style={{margin:0}}>魏 司令官：管理画面</h2>
          <div style={{display:'flex', gap:'10px'}}>
             <button onClick={()=>setAdminView('orders')} style={{background: adminView==='orders'?'#0071e3':'#333', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>注文一覧</button>
             <button onClick={()=>setAdminView('config')} style={{background: adminView==='config'?'#0071e3':'#333', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>商品管理</button>
             <button onClick={()=>{setIsLoggedIn(false); localStorage.removeItem('admin_pw'); setPassword(''); setData(null);}} style={{background:'#cf6679', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Logout</button>
          </div>
        </div>

        {adminView === 'orders' ? (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(350px, 1fr))', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={styles.adminCard}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <span style={{background:'#0071e3', padding:'2px 8px', borderRadius:'4px', fontSize:'12px', color:'#fff'}}>#{o.id}</span>
                <strong style={{color:'#fff'}}>{o.username}</strong>
                <span style={{color:'#03dac6', fontWeight:'bold'}}>¥{o.totalPrice}</span>
              </div>
              <div style={{fontSize:'12px', color:'#aaa', marginBottom:'5px'}}>
                <div>📅 {new Date(o.createdAt || Date.now()).toLocaleString()}</div>
                <div>🔒 IP: <span style={{color:'#ff5252'}}>{o.ipAddress}</span></div>
                <div>🆔 Device: {o.browserId}</div>
                <div style={{marginTop:'5px', fontWeight:'bold', color: o.status === 'completed' ? '#4caf50' : o.status === 'in_progress' ? '#fbc02d' : '#fff'}}>
                    Status: {o.status}
                </div>
              </div>
              <div style={{background:'#000', padding:'10px', borderRadius:'5px', fontFamily:'monospace', fontSize:'12px', wordBreak:'break-all', marginBottom:'10px', color:'#ccc'}}>
                <div style={{color:'#888', marginBottom:'2px'}}>引き継ぎ情報:</div>
                ID: <span style={{color:'#fff', fontWeight:'bold', fontSize:'14px'}}>{o.transferCode}</span><br/>
                PW: <span style={{color:'#fff', fontWeight:'bold', fontSize:'14px'}}>{o.authPassword}</span>
              </div>
              <div style={{fontSize:'12px', marginBottom:'10px', padding:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'5px', color:'#ddd'}}>
                <strong style={{color:'#bbb'}}>注文内容:</strong><br/>
                {o.services}
              </div>
              <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                <button onClick={()=>adminAction(o.id, 'start')} style={{flex:1, background:'#fbc02d', color:'#000', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer', fontWeight:'bold'}}>🚀 開始</button>
                <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>adminAction(o.id, 'complete', {image: e.target.files![0], userId: o.userId})} />
                <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#4caf50', color:'#fff', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer', fontWeight:'bold'}}>✅ 完了</button>
                <button onClick={()=>adminAction(o.id, 'scrub')} style={{flex:1, background:'#757575', border:'none', color:'#fff', borderRadius:'5px', padding:'8px', cursor:'pointer'}}>🗑️ 抹消</button>
                <button onClick={() => window.open(o.paypayUrl, '_blank')} style={{flex:1, background:'#fff', color:'#000', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>PayPay</button>
              </div>
            </div>
          ))}
        </div>
        ) : (
             <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                 <div style={styles.adminCard}>
                     <h3>一括設定</h3>
                     <button onClick={() => {
                         const accIds = ACC_ITEMS.map(i => i.id);
                         const isAllDisabled = accIds.every(id => disabledItems.includes(id));
                         const newDisabled = isAllDisabled 
                            ? disabledItems.filter(id => !accIds.includes(id))
                            : [...new Set([...disabledItems, ...accIds])];
                         setDisabledItems(newDisabled);
                         fetch(`${API_BASE}/api/admin/config`, { method: 'POST', body: JSON.stringify({ disabledItems: newDisabled }), headers: { 'Content-Type': 'application/json', 'Authorization': password } });
                     }} style={{...styles.checkoutBtn, background: '#e74c3c'}}>アカウント販売を停止/再開</button>
                 </div>

                 <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'15px'}}>
                     {[...DAIKO_LIST, ...ACC_LIST].map(item => (
                         <div key={item.id} style={{...styles.adminCard, opacity: disabledItems.includes(item.id) ? 0.5 : 1}}>
                             <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                 <span style={{color:'#fff'}}>{item.name}</span>
                                 <button onClick={()=>toggleProductConfig(item.id)} style={{background: disabledItems.includes(item.id) ? '#333' : '#4caf50', color:'#fff', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>
                                     {disabledItems.includes(item.id) ? '無効' : '有効'}
                                 </button>
                             </div>
                         </div>
                     ))}
                 </div>
                 <button onClick={() => setAdminView('orders')} style={{...styles.checkoutBtn, background:'#777', marginTop:'20px'}}>← 注文一覧に戻る</button>
             </div>
        )}
      </div>
    );
  }

  // --- Render (User) ---
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 onClick={()=>{setView('main'); setFormOpen(false);}} style={styles.headerTitle}>WEI STORE 🐾</h1>
        
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            {discordUser && activeOrder && (
                <button onClick={() => { setView('main'); setFormOpen(false); }} style={{background: isDark?'#333':'#f0f7ff', color:'#0071e3', border:'1px solid #0071e3', padding:'8px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px'}}>
                    📦 注文状況
                </button>
            )}

            {!discordUser && (
                <button onClick={toggleTheme} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}>
                    {isDark ? '☀️' : '🌙'}
                </button>
            )}
            
            {discordUser ? (
                <div style={{position:'relative'}}>
                    <img src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} alt="User" style={{width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #eee'}} onClick={() => setShowUserMenu(!showUserMenu)}/>
                    {showUserMenu && <UserMenu />}
                </div>
            ) : (
                <button onClick={handleDiscordLogin} style={{background:'#5865F2', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'20px', fontSize:'13px', fontWeight:'bold', cursor:'pointer'}}>Discord Login</button>
            )}
        </div>
      </header>

      <main style={styles.main}>
        {view === 'settings' && discordUser ? ( <SettingsView /> ) :
         activeOrder && activeOrder.status !== 'scrubbed' && view === 'main' && !formOpen ? ( <StatusDashboard order={activeOrder} /> ) :
         view === 'main' && !formOpen ? (
          <>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'30px'}}>
              <div onClick={() => setView('daiko')} style={styles.card}><div style={{fontSize:'40px', marginBottom:'10px'}}>🎮</div><div style={{fontWeight:'bold', fontSize:'18px', color: isDark?'#fff':'#333'}}>代行サービス</div><div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>最強のデータを作成</div></div>
              <div onClick={() => setView('account')} style={styles.card}><div style={{fontSize:'40px', marginBottom:'10px'}}>🎁</div><div style={{fontWeight:'bold', fontSize:'18px', color: isDark?'#fff':'#333'}}>アカウント販売</div><div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>即座にスタート</div></div>
            </div>
            <div style={{...styles.card, background: isDark?'#333':'#fff9c4', border: isDark?'1px solid #555':'1px solid #fbc02d'}}>
              <h3 style={{margin:'0 0 10px 0', fontSize:'16px', color: isDark?'#fff':'#333'}}>📢 お知らせ</h3>
              <p style={{margin:0, fontSize:'14px', color: isDark?'#ccc':'#333'}}>現在、全ての代行メニューが通常通りご利用いただけます。<br/>BAN保証オプションの加入を強く推奨しております。</p>
              {discordUser && activeOrder && (
                  <button onClick={() => { setView('main'); setFormOpen(false); }} style={{...styles.checkoutBtn, background:'#0071e3', color:'#fff', width:'100%', marginTop:'15px', padding:'10px 20px', fontSize:'14px'}}>
                      📦 注文状況を確認する
                  </button>
              )}
            </div>
          </>
        ) : formOpen ? (
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

                {(view === 'daiko' ? DAIKO_CATEGORIES : [{id:'acc', name:'🎁 アカウント販売', items:ACC_ITEMS}]).map(cat => ({ // ★ここでDAIKO_CATEGORIESを直接使用
                    ...cat, items: cat.items.filter(i => !disabledItems.includes(i.id) && (i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.description.toLowerCase().includes(searchTerm.toLowerCase())))
                })).filter(c => c.items.length > 0).map(cat => (
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
      {showReviewModal && <ReviewModal />}
      {DEBUG_MODE && <div style={styles.debugOverlay}>
        <h3>DEBUG LOG</h3>
        {debugInfo.map((log, index) => <div key={index}>{log}</div>)}
      </div>}
    </div>
  );
}
