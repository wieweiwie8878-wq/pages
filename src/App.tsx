import React, { useState, useEffect, useMemo } from 'react';

const API_BASE = "https://worker.nasserl.workers.dev"; // あなたのWorkersのURL

const DAIKO_CATEGORIES = [
  {
    id: 'basic_services_80',
    name: '💰 80円 基本強化パック (猫缶、XP、チケットなど)',
    description: 'ゲームの基本となる猫缶やXPのカンスト、各種チケットの付与、特定のステージ開放など、人気の基本サービスをお得な価格でご提供します。',
    items: [
      { id: 'neko', name: '猫缶カンスト', price: 80, description: '猫缶を最大値（約99999）まで増加させます。' },
      { id: 'xp', name: 'XPカンスト', price: 80, description: 'XPを最大値（約99999999）まで増加させます。' },
      { id: 't_norm', name: '通常チケ(100枚)', price: 80, description: '通常チケットを上限の100枚まで付与します。' },
      { id: 't_rare', name: 'レアチケ(100枚)', price: 80, description: 'レアチケットを上限の100枚まで付与します。' },
      { id: 'st_one', name: '1ステージ開放', price: 80, description: '指定された未開放のステージを1つ解放します。' },
    ]
  },
  {
    id: 'advanced_custom_100',
    name: '✨ 100円 応用カスタムメニュー (NP、アイテム、城素材など)',
    description: 'NPや各種アイテム、キャッツアイ、ネコビタン、城素材、マタタビなど、ゲームの進行を強力にサポートする応用的なカスタマイズが可能です。プレイ時間や城レベルの調整もこちらから。',
    items: [
      { id: 'np', name: 'NP変更', price: 100, description: 'NP (にゃんこポイント) の値を任意に変更します。' },
      { id: 'item', name: 'アイテム変更', price: 100, description: 'スピードアップ、ネコボンなど各種アイテムの数を指定して変更します。' },
      { id: 'eye', name: 'キャッツアイ変更', price: 100, description: 'キャッツアイの値を任意に変更します。' },
      { id: 'bitan', name: 'ネコビタン変更', price: 100, description: 'ネコビタンの数を任意に変更します。' },
      { id: 'castle_m', name: '城素材変更', price: 100, description: '城の各種素材（鉄、石、魔法など）の数を変更します。' },
      { id: 'matatabi', name: 'マタタビ変更', price: 100, description: 'マタタビ（赤、青、黄、緑、紫）の数を変更します。' },
      { id: 'leader', name: 'リーダーシップ変更', price: 100, description: 'リーダーシップの数を任意に変更します。' },
      { id: 'ptime', name: 'プレイ時間変更', price: 100, description: 'ゲームのプレイ時間を変更します。' },
      { id: 'clv', name: '城のレベル変更', price: 100, description: '城のレベルを任意に変更します。' },
      { id: 'g_char', name: 'グループキャラ解放', price: 100, description: '特定のグループに属するキャラクターを解放します。' },
      { id: 'st_ch', name: 'ステージ章解放', price: 100, description: '特定のステージ章を解放します。' },
      { id: 'legend', name: 'レジェステ解放', price: 100, description: 'レジェンドステージを解放します。' },
      { id: 'treasure', name: 'お宝解放', price: 100, description: '指定されたお宝を解放します。' },
    ]
  },
  {
    id: 'all_characters_150',
    name: '😼 150円 全キャラ解放 (圧倒的戦力)',
    description: '全てのキャラクター（コラボ限定など一部を除く）を一度に解放し、すぐに最強の編成を組めるようになります。戦力不足を一気に解消！',
    items: [
      { id: 'all_c', name: '全キャラ解放', price: 150, description: '全てのキャラクターを解放します。（コラボ限定など一部を除く）' },
    ]
  },
  {
    id: 'error_fix_200',
    name: '🛠️ 200円 エラーキャラ削除 (安心のメンテナンス)',
    description: 'ゲーム内で発生する可能性のある「エラーキャラ」を安全に削除し、ゲームの安定動作を保ちます。予期せぬ不具合の解消に。',
    items: [
      { id: 'err', name: 'エラーキャラ消去', price: 200, description: 'エラー表示されているキャラクターを安全に削除します。' },
    ]
  },
  {
    id: 'ban_guarantee_500',
    name: '🛡️ 500円 BAN保証オプション (超推奨！)',
    description: '万が一、代行後にアカウントBANが発生した場合に補償を提供する、安心のオプションです。より安全にサービスをご利用いただけます。',
    items: [
      { id: 'ban_g', name: 'BAN保証', price: 500, description: '万が一のアカウントBAN時に保証を提供します。（超推奨）' }
    ]
  }
];

const ACC_ITEMS = [
  { id: 'acc_b', name: '【基本セット】400円', price: 400, description: '猫缶とXPがカンスト済みの基本アカウントです。' },
  { id: 'acc_s', name: '【最強セット】500円', price: 500, description: '猫缶、XP、全キャラ解放（一部を除く）の最強アカウントです。' }
];

const DAIKO_LIST = DAIKO_CATEGORIES.flatMap(category => category.items);
const ACC_LIST = ACC_ITEMS;

// カスタムモーダルコンポーネントを定義
const CustomModal = ({ message, onClose }: { message: string; onClose: () => void }) => {
    return (
        <div style={modalOverlayS}>
            <div style={modalContentS}>
                <p style={{fontSize: '16px', fontWeight: 'bold', marginBottom: '15px'}}>{message}</p>
                <button onClick={onClose} style={modalButtonS}>閉じる</button>
            </div>
        </div>
    );
};

export default function App() {
  const [view, setView] = useState<'main' | 'daiko' | 'account'>('main');
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  const isAdmin = window.location.hostname.startsWith('admin.');

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paypayLinkValue, setPaypayLinkValue] = useState<string>('');
  const [paypayLinkError, setPaypayLinkError] = useState<string | null>(null);

  // カスタムモーダル表示用のstate
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customModalMessage, setCustomModalMessage] = useState('');


  const refresh = () => fetch(`${API_BASE}/api/admin/stats`, { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);
  const adminAction = (id: any, action: string, extra = {}) => {
    const fd = new FormData(); fd.append('id', id); fd.append('action', action);
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));
    fetch(`${API_BASE}/api/admin/action`, { method: 'POST', body: fd, headers: { 'Authorization': password } }).then(refresh);
  };

  useEffect(() => {
    if (isAdmin && isLoggedIn) {
      refresh();
    } else if (isAdmin && password) {
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
          localStorage.removeItem('admin_pw');
          setPassword('');
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        localStorage.removeItem('admin_pw');
        setPassword('');
        setIsLoggedIn(false);
      });
    }
  }, [isAdmin, isLoggedIn, password]);

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
            setCustomModalMessage('ログイン失敗: パスワードが違います。'); // カスタムモーダルでエラー表示
            setShowCustomModal(true);
            setIsLoggedIn(false);
          }
        }} style={btnS}>LOGIN</button>
        {showCustomModal && (
          <CustomModal message={customModalMessage} onClose={() => setShowCustomModal(false)} />
        )}
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleItemSelection = (itemId: string) => {
    setSelected(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const allItemsFlat = useMemo(() => [...DAIKO_LIST, ...ACC_LIST], []);

  const totalSelectedPrice = useMemo(() => {
    return selected.reduce((sum, itemId) => {
      const item = allItemsFlat.find(p => p.id === itemId);
      return sum + (item?.price || 0);
    }, 0);
  }, [selected, allItemsFlat]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) {
      return DAIKO_CATEGORIES;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return DAIKO_CATEGORIES.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(lowerSearchTerm) ||
        item.description.toLowerCase().includes(lowerSearchTerm)
      )
    })).filter(category => category.items.length > 0);
  }, [searchTerm]);

  const toggleAllItems = (all: boolean) => {
    if (all) {
      setSelected(allItemsFlat.map(item => item.id));
      setExpandedCategories(DAIKO_CATEGORIES.map(c => c.id));
    } else {
      setSelected([]);
      setExpandedCategories([]);
    }
  };

  const toggleCategoryItems = (categoryId: string, selectAll: boolean) => {
    const category = DAIKO_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const categoryItemIds = category.items.map(item => item.id);
    setSelected(prev => {
      if (selectAll) {
        return [...new Set([...prev, ...categoryItemIds])];
      } else {
        return prev.filter(id => !categoryItemIds.includes(id));
      }
    });
    if (selectAll && !expandedCategories.includes(categoryId)) {
      setExpandedCategories(prev => [...prev, categoryId]);
    }
  };

  const handlePaypayLinkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPaypayLinkValue(value);
    const paypayRegex = /paypay\.ne\.jp/i;
    if (value === '' || paypayRegex.test(value)) {
      setPaypayLinkError(null);
    } else {
      setPaypayLinkError('PayPay関連のURLではありません。URLに "paypay.ne.jp" が含まれているか確認してください。');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (paypayLinkError) {
      setCustomModalMessage(paypayLinkError); // カスタムモーダルでエラー表示
      setShowCustomModal(true);
      return;
    }

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
      await fetch(`${API_BASE}/api/sync-order`, {
        method: 'POST',
        body: JSON.stringify(order),
        headers: { 'Content-Type': 'application/json' }
      });
      setCustomModalMessage("注文完了しました！"); // カスタムモーダルで成功表示
      setShowCustomModal(true);
      // モーダルを閉じるまで待ってからリロードしたい場合
      // setTimeout(() => { window.location.reload(); }, 2000); // 2秒後にリロード
      // モーダルが閉じられた時にリロードするハンドラを渡す
      const handleCloseAndReload = () => {
        setShowCustomModal(false);
        window.location.reload();
      };
      // onCloseハンドラをモーダルに渡す
      return (
        <CustomModal message={customModalMessage} onClose={handleCloseAndReload} />
      );

    } catch (error) {
      console.error("注文送信中にエラーが発生しました:", error);
      setCustomModalMessage("注文送信中にエラーが発生しました。時間をおいて再度お試しください。");
      setShowCustomModal(true);
    }
  };


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

            <input
              type="text"
              placeholder="商品を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputS, marginBottom: '15px', padding: '10px' }}
            />

            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <button onClick={() => toggleAllItems(true)} style={toggleAllBtnS}>全て選択</button>
              <button onClick={() => toggleAllItems(false)} style={toggleAllBtnS}>全て解除</button>
            </div>

            <div style={totalPriceDisplayS}>
              合計金額: <span style={{ color: '#0071e3', fontWeight: 'bold' }}>¥{totalSelectedPrice}</span>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {(view === 'daiko' ? filteredCategories : [{ id: 'account_sales', name: '🎁 アカウント販売 (基本セット、最強セット)', description: '即座にプレイを開始できる初期アカウントを販売しています。強力なスタートダッシュを切りましょう！', items: ACC_LIST }]).map(category => {
                const isCategoryExpanded = expandedCategories.includes(category.id);
                if (view === 'daiko' && category.items.length === 0 && searchTerm) return null;

                return (
                  <div key={category.id} style={categoryContainerS}>
                    <div onClick={() => toggleCategory(category.id)} style={categoryHeaderS}>
                      <div>{category.name}</div>
                      <div style={{fontSize:'12px', color:'#777'}}>{isCategoryExpanded ? '▲' : '▼'}</div>
                    </div>
                    {isCategoryExpanded && (
                      <div style={categoryContentS}>
                        <p style={{fontSize:'13px', color:'#666', marginBottom:'10px'}}>{category.description}</p>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                          <button onClick={(e) => { e.stopPropagation(); toggleCategoryItems(category.id, true); }} style={categoryToggleBtnS}>カテゴリ内全て選択</button>
                          <button onClick={(e) => { e.stopPropagation(); toggleCategoryItems(category.id, false); }} style={categoryToggleBtnS}>カテゴリ内全て解除</button>
                        </div>
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
          <form onSubmit={handleSubmit} style={formS}>
            <input name="un" placeholder="お名前" style={inputS} required />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}><input name="tc" placeholder="引き継ぎコード" style={inputS} required /><input name="ap" placeholder="認証番号/パスワード" style={inputS} required /></div>
            <textarea
              name="p"
              placeholder="PayPayリンク (例: https://paypay.ne.jp/link/xxxxxx)"
              style={{...inputS, height:'80px', borderColor: paypayLinkError ? '#dc3545' : '#d2d2d7'}}
              value={paypayLinkValue}
              onChange={handlePaypayLinkChange}
              required
            />
            {paypayLinkError && <p style={{fontSize:'12px', color:'#dc3545', marginTop:'-8px', marginBottom:'10px'}}>{paypayLinkError}</p>}
            <p style={{fontSize:'12px', color:'#dc3545', marginTop:'-8px', marginBottom:'10px', textAlign: 'center'}}>
              ⚠️ PayPayリンクの金額と、選択されたサービスの合計金額が一致しない場合、注文は受理されません。
            </p>
            <button type="submit" style={submitBtnS} disabled={!!paypayLinkError}>¥{totalSelectedPrice} で確定</button>
          </form>
        )}
      </main>
      {showCustomModal && (
        <CustomModal message={customModalMessage} onClose={() => { setShowCustomModal(false); if (customModalMessage === "注文完了しました！") window.location.reload(); }} />
      )}
    </div>
  );
}

const headerS: any = { padding:'15px', textAlign:'center', fontSize:'18px', fontWeight:'bold', borderBottom:'1px solid #d2d2d7', background:'#fff' };
const mainCardS: any = { background:'#fff', padding:'50px 20px', borderRadius:'20px', textAlign:'center', cursor:'pointer', border:'1px solid #d2d2d7', fontSize:'18px', fontWeight:'bold' };

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
  background: '#e9e9eb',
};
const categoryContentS: any = {
  padding: '10px 15px',
  borderTop: '1px solid #eee',
  background: '#fcfcfc',
};

const itemDefaultS: any = {
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #eee',
  cursor: 'pointer',
  marginBottom: '5px',
  background: '#fff',
  transition: 'all 0.2s ease-in-out',
};
const itemSelectedS: any = {
  ...itemDefaultS,
  border: '2px solid #0071e3',
  background: '#e0f2ff',
};

const formS: any = { marginTop:'40px', background:'#fff', padding:'25px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)' };
const inputS: any = { padding:'12px', borderRadius:'10px', border:'1px solid #d2d2d7', width:'100%', boxSizing:'border-box', marginBottom:'10px' };
const submitBtnS: any = { width:'100%', background:'#0071e3', color:'#fff', border:'none', padding:'15px', borderRadius:'10px', fontSize:'16px', fontWeight:'bold', cursor:'pointer' };
const copyS: any = { flex:1, background:'#222', color:'#fa0', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer' };
const centerS: any = { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000' };
const btnS: any = { background:'#4af', color:'#fff', border:'none', padding:'10px 30px', borderRadius:'5px', cursor:'pointer' };

const toggleAllBtnS: any = {
  flex: 1,
  padding: '10px 15px',
  borderRadius: '8px',
  border: '1px solid #0071e3',
  background: '#0071e3',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
};

const categoryToggleBtnS: any = {
  flex: 1,
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #0071e3',
  background: '#0071e3',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '12px',
};

const totalPriceDisplayS: any = {
  background: '#fff',
  padding: '15px',
  borderRadius: '12px',
  border: '1px solid #d2d2d7',
  textAlign: 'center',
  fontSize: '18px',
  marginBottom: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

// カスタムモーダル用のスタイル
const modalOverlayS: any = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
};

const modalContentS: any = {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    maxWidth: '350px',
    textAlign: 'center',
};

const modalButtonS: any = {
    backgroundColor: '#0071e3',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    marginTop: '15px',
};
