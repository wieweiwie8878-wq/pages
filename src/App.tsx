import React, { useState, useEffect, useMemo } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // WorkersのURL

// 商品データの定義（アイコン追加などでリッチに）
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

// スタイル定義（CSS-in-JS）
const styles = {
  container: {
    fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    background: '#f4f6f8',
    minHeight: '100vh',
    color: '#333',
    paddingBottom: '80px', // フッター用スペース
  },
  header: {
    background: '#fff',
    padding: '20px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0,
  },
  main: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '0 20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #eaeaea',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    background: '#fff',
    borderRadius: '12px',
    cursor: 'pointer',
    userSelect: 'none' as const,
    border: '1px solid #eee',
    marginBottom: '8px',
  },
  categoryTitle: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  itemContainer: {
    padding: '10px 15px',
    background: '#f9fafb',
    borderLeft: '1px solid #eee',
    borderRight: '1px solid #eee',
    borderBottom: '1px solid #eee',
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
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  itemSelected: {
    borderColor: '#0071e3',
    background: '#f0f7ff',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#0071e3',
  },
  searchBar: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #ddd',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  floatingFooter: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '600px',
    background: '#fff',
    padding: '15px 20px',
    borderRadius: '50px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 200,
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
    background: '#fff',
    padding: '30px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    marginTop: '20px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #ddd',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
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
    background: '#1a1a1a',
    color: '#fff',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'monospace',
  },
};

// カスタムモーダル
const CustomModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h3 style={{marginTop:0}}>お知らせ</h3>
      <p style={{fontSize: '16px', lineHeight: '1.5'}}>{message}</p>
      <button onClick={onClose} style={{...styles.checkoutBtn, width: '100%', marginTop: '20px'}}>閉じる</button>
    </div>
  </div>
);

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // データ取得関連
  const refreshAdmin = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);
  
  const adminAction = (id: any, action: string, extra = {}) => {
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(refreshAdmin);
  };

  useEffect(() => {
    if (isAdmin && password) {
      fetch(`${API_BASE}/api/auth`, { method: 'POST', body: JSON.stringify({ password }), headers: {'Content-Type': 'application/json'} })
        .then(res => res.json())
        .then(d => { if(d.ok) { setIsLoggedIn(true); refreshAdmin(); } else { setIsLoggedIn(false); localStorage.removeItem('admin_pw'); }})
        .catch(() => setIsLoggedIn(false));
    }
  }, [isAdmin]);

  // 管理者画面
  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#111', color:'#fff'}}>
        <h1>WEI ADMIN</h1>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'10px', borderRadius:'5px', border:'none', marginBottom:'10px'}} placeholder="Password" />
        <button onClick={() => { localStorage.setItem('admin_pw', password); window.location.reload(); }} style={styles.checkoutBtn}>LOGIN</button>
      </div>
    );
    return (
      <div style={styles.adminContainer}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2>魏 司令官：管理画面</h2>
          <button onClick={()=>{localStorage.removeItem('admin_pw'); window.location.reload();}} style={{background:'#e74c3c', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Logout</button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={{background:'#222', border:'1px solid #444', padding:'15px', borderRadius:'10px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <strong>#{o.id} {o.username}</strong>
                <span style={{color:'#4af'}}>¥{o.totalPrice}</span>
              </div>
              <div style={{fontSize:'12px', color:'#ff4444', margin:'5px 0'}}>IP: {o.ipAddress}</div>
              <div style={{background:'#000', padding:'8px', borderRadius:'5px', fontFamily:'monospace', fontSize:'12px', wordBreak:'break-all'}}>
                ID: {o.transferCode}<br/>PW: {o.authPassword}
              </div>
              <div style={{fontSize:'12px', marginTop:'8px', color:'#ccc'}}>{o.services}</div>
              <div style={{display:'flex', gap:'5px', marginTop:'15px'}}>
                <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>adminAction(o.id, 'complete', {image: e.target.files![0], userId: o.userId})} />
                <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#28a745', color:'#fff', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer'}}>完了通知</button>
                <button onClick={()=>adminAction(o.id, 'scrub')} style={{background:'#555', border:'none', color:'#fff', borderRadius:'5px', padding:'8px', cursor:'pointer'}}>抹消</button>
                <a href={o.paypayUrl} target="_blank" rel="noreferrer" style={{background:'#fff', color:'#000', textDecoration:'none', padding:'8px 12px', borderRadius:'5px', fontSize:'14px'}}>PayPay</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ユーザー画面ロジック
  const allItemsFlat = useMemo(() => [...DAIKO_LIST, ...ACC_LIST], []);
  const totalSelectedPrice = useMemo(() => selected.reduce((sum, id) => sum + (allItemsFlat.find(p=>p.id===id)?.price || 0), 0), [selected, allItemsFlat]);

  const toggleItem = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  const toggleCategory = (id: string) => setExpandedCategories(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  
  const toggleAll = (select: boolean) => {
    if(select) {
      setSelected(allItemsFlat.map(x=>x.id));
      setExpandedCategories(DAIKO_CATEGORIES.map(x=>x.id));
    } else {
      setSelected([]);
      setExpandedCategories([]);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return DAIKO_CATEGORIES;
    return DAIKO_CATEGORIES.map(c => ({
      ...c, items: c.items.filter(i => i.name.includes(searchTerm) || i.description.includes(searchTerm))
    })).filter(c => c.items.length > 0);
  }, [searchTerm]);

  const handlePaypay = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPaypayLinkValue(val);
    // 緩和されたバリデーション
    setPaypayLinkError(val && /paypay\.ne\.jp/.test(val) ? null : 'PayPayのリンクを含めてください');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (paypayLinkError) return;
    
    const fd = new FormData(e.currentTarget);
    const order = {
      username: fd.get('un'),
      tc: fd.get('tc'),
      ap: fd.get('ap'),
      paypayUrl: paypayLinkValue,
      services: allItemsFlat.filter(p=>selected.includes(p.id)).map(p=>p.name).join(','),
      total: totalSelectedPrice,
      browserId: localStorage.getItem('wei_id') || Math.random().toString(36).substring(2, 15)
    };

    try {
      await fetch(`${API_BASE}/api/sync-order`, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
      setModalMsg("✅ 注文を受け付けました！\nDiscord Botより管理者へ通知されました。");
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
      </header>

      <main style={styles.main}>
        {view === 'main' ? (
          <>
            {/* メインメニュー */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'30px'}}>
              <div onClick={() => setView('daiko')} style={styles.card}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>🎮</div>
                <div style={{fontWeight:'bold', fontSize:'18px'}}>代行サービス</div>
                <div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>最強のデータを作成</div>
              </div>
              <div onClick={() => setView('account')} style={styles.card}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>🎁</div>
                <div style={{fontWeight:'bold', fontSize:'18px'}}>アカウント販売</div>
                <div style={{fontSize:'12px', color:'#777', marginTop:'5px'}}>即座にスタート</div>
              </div>
            </div>
            
            {/* お知らせエリア */}
            <div style={{...styles.card, background:'#fff9c4', border:'1px solid #fbc02d'}}>
              <h3 style={{margin:'0 0 10px 0', fontSize:'16px'}}>📢 お知らせ</h3>
              <p style={{margin:0, fontSize:'14px'}}>
                現在、全ての代行メニューが通常通りご利用いただけます。<br/>
                BAN保証オプションの加入を強く推奨しております。
              </p>
            </div>
          </>
        ) : (
          <div>
            <button onClick={() => { setView('main'); setFormOpen(false); }} style={{background:'none', border:'none', color:'#0071e3', fontSize:'16px', cursor:'pointer', marginBottom:'20px'}}>← 戻る</button>
            
            {/* 検索 & 全選択 */}
            <input type="text" placeholder="🔍 商品を検索..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={styles.searchBar} />
            <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
              <button onClick={()=>toggleAll(true)} style={{...styles.checkoutBtn, padding:'8px 15px', fontSize:'12px', background:'#eee', color:'#333'}}>全て選択</button>
              <button onClick={()=>toggleAll(false)} style={{...styles.checkoutBtn, padding:'8px 15px', fontSize:'12px', background:'#eee', color:'#333'}}>全て解除</button>
            </div>

            {/* 商品リスト */}
            {(view === 'daiko' ? filteredCategories : [{id:'acc', name:'アカウント販売', description:'初期アカウント', items:ACC_ITEMS}]).map(cat => (
              <div key={cat.id}>
                <div onClick={() => toggleCategory(cat.id)} style={styles.categoryHeader}>
                  <div>
                    <div style={styles.categoryTitle}>{cat.name}</div>
                    <div style={{fontSize:'12px', color:'#777'}}>{cat.description}</div>
                  </div>
                  <div>{expandedCategories.includes(cat.id) ? '▲' : '▼'}</div>
                </div>
                {expandedCategories.includes(cat.id) && (
                  <div style={styles.itemContainer}>
                    <div style={{display:'flex', justifyContent:'flex-end', marginBottom:'10px'}}>
                      <button onClick={()=>setSelected(prev => [...new Set([...prev, ...cat.items.map(i=>i.id)])])} style={{fontSize:'11px', padding:'5px 10px', border:'1px solid #ddd', borderRadius:'15px', background:'#fff', cursor:'pointer'}}>このカテゴリを全選択</button>
                    </div>
                    {cat.items.map(item => (
                      <div key={item.id} onClick={() => toggleItem(item.id)} style={{...styles.item, ...(selected.includes(item.id) ? styles.itemSelected : {})}}>
                        <div>
                          <div style={{fontWeight:'bold', fontSize:'14px'}}>{item.name}</div>
                          <div style={{fontSize:'11px', color:'#666'}}>{item.description}</div>
                        </div>
                        <div style={styles.itemPrice}>¥{item.price}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 注文フォーム (オーバーレイまたは下部表示) */}
        {formOpen && selected.length > 0 && (
          <div style={styles.formContainer}>
            <h2 style={{textAlign:'center', marginBottom:'20px'}}>注文情報の入力</h2>
            <form onSubmit={handleSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>お名前 (ニックネーム可)</label>
                <input name="un" required style={styles.input} placeholder="Wei" />
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
                <div style={{fontSize:'11px', color:'#777', marginTop:'5px'}}>※ URLに "paypay.ne.jp" が含まれている必要があります。</div>
              </div>
              <button type="submit" style={{...styles.checkoutBtn, width:'100%'}} disabled={!!paypayLinkError}>
                ¥{totalSelectedPrice} で注文確定
              </button>
              <button type="button" onClick={()=>setFormOpen(false)} style={{width:'100%', padding:'10px', background:'none', border:'none', color:'#777', cursor:'pointer', marginTop:'10px'}}>キャンセル</button>
            </form>
          </div>
        )}
      </main>

      {/* フローティングフッター (カート) */}
      {!formOpen && selected.length > 0 && (
        <div style={styles.floatingFooter}>
          <div style={{fontWeight:'bold', fontSize:'16px'}}>
            {selected.length}点 <span style={{color:'#0071e3', marginLeft:'5px'}}>¥{totalSelectedPrice}</span>
          </div>
          <button onClick={() => setFormOpen(true)} style={styles.checkoutBtn}>手続きへ</button>
        </div>
      )}

      {/* モーダル */}
      {showModal && <CustomModal message={modalMsg} onClose={() => { setShowModal(false); if(modalMsg.includes('注文を受け付け')) window.location.reload(); }} />}
    </div>
  );
}
