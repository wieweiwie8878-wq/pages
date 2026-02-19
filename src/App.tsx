import React, { useState, useEffect } from 'react';

// 環境変数 VITE_API_URL があればそれを使い、なければ仮のURLを使用
// ※デプロイ後にWorkerのURLが決まったら、Cloudflare Pagesの環境変数設定で VITE_API_URL を設定するか、ここを直接書き換えてください。
const API_BASE = import.meta.env.VITE_API_URL || "https://worker.nasserl.workers.dev"; 
const DISCORD_CLIENT_ID = "1456569335190388951"; 

// 現在のページURLをリダイレクト先に設定 (localhostでも本番でも動くように)
const REDIRECT_URI = "https://kenji123.f5.si";
const SUPPORT_SERVER_URL = "https://discord.gg/t68XQeTtx8"; 

const getStyles = (isDark: boolean) => ({
  container: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    background: isDark ? '#1a1a1a' : '#f4f6f8',
    minHeight: '100vh',
    color: isDark ? '#fff' : '#333',
    paddingBottom: '50px',
    transition: 'background 0.3s, color 0.3s',
  },
  header: {
    background: isDark ? '#2a2a2a' : '#fff',
    padding: '15px 20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    margin: 0,
    cursor: 'pointer',
    color: isDark ? '#fff' : '#333',
  },
  main: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '0 20px',
  },
  card: {
    background: isDark ? '#2a2a2a' : '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: isDark ? '1px solid #333' : '1px solid #eaeaea',
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
    border: isDark ? '1px solid #444' : '1px solid #eee',
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
    color: '#333'
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
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  }
});

export default function App() {
  const [discordUser, setDiscordUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const [data, setData] = useState<any>(null);
  
  // admin.xxx または ?admin=true で管理者モード判定
  const isAdmin = window.location.hostname.startsWith('admin.') || new URLSearchParams(window.location.search).get('admin') === 'true';

  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  const styles = getStyles(isDark);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
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
    window.location.href = "/";
  };

  const fetchUserData = async () => {
      if(discordUser) {
          try {
            // 最新の注文
            const resOrder = await fetch(`${API_BASE}/api/my-order?discordId=${discordUser.id}`);
            if (resOrder.ok) {
                const d = await resOrder.json();
                if(d.found) setActiveOrder(d.order);
                else setActiveOrder(null);
            }
            // 履歴
            const resHist = await fetch(`${API_BASE}/api/my-history?discordId=${discordUser.id}`);
            if (resHist.ok) {
                const d = await resHist.json();
                if(d.history) setOrderHistory(d.history);
            }
          } catch (e) {
              console.error("Fetch error:", e);
          }
      }
  };

  const postReview = async () => {
    if (!activeOrder || !reviewContent || !discordUser) return;
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
        if (!res.ok) throw new Error("Failed");
        
        setModalMsg("✅ 実績を送信しました！ご協力ありがとうございます。");
        setShowModal(true);
        setShowReviewModal(false);
        setReviewContent('');
    } catch (e) {
        setModalMsg("❌ 送信に失敗しました。");
        setShowModal(true);
    }
  };
  
  // --- Admin Logic ---
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
  
  const adminAction = async (id: any, action: string, extra: any = {}) => {
    const fd = new FormData(); 
    fd.append('id', id); 
    fd.append('action', action);
    
    // 画像ファイルなどの追加データをFormDataに追加
    Object.entries(extra).forEach(([k, v]: any) => fd.append(k, v));

    try {
        await fetch(`${API_BASE}/api/admin/action`, { 
            method: 'POST', 
            body: fd, 
            headers: { 'Authorization': password } 
        });
        refreshAdmin(password);
    } catch (e) {
        alert("Action failed");
    }
  };

  // --- Effects ---
  useEffect(() => { 
      document.body.style.background = isDark ? '#1a1a1a' : '#f4f6f8';
      document.body.style.color = isDark ? '#fff' : '#333';
  }, [isDark]);
  
  useEffect(() => {
    // Admin Auto Login
    if (isAdmin && password && !isLoggedIn) { setTimeout(() => refreshAdmin(password), 500); }
    
    // Discord OAuth Callback
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      window.history.replaceState({}, document.title, "/"); // URLからcodeを消す
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
        }
      })
      .catch(err => console.error("Login failed:", err));
    } else { 
        const saved = localStorage.getItem('discord_user'); 
        if (saved) setDiscordUser(JSON.parse(saved)); 
    }
  }, [isAdmin]);

  // 定期更新
  useEffect(() => {
      if(discordUser) {
          fetchUserData();
          const timer = setInterval(fetchUserData, 15000); // 15秒ごとに更新
          return () => clearInterval(timer);
      }
  }, [discordUser]);

  // --- Components ---

  const CustomModal = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3 style={{marginTop:0, color:'#333'}}>お知らせ</h3>
        <p style={{fontSize: '16px', lineHeight: '1.5', whiteSpace: 'pre-wrap', color:'#555'}}>{message}</p>
        <button onClick={onClose} style={{...styles.checkoutBtn, width: '100%', marginTop: '20px'}}>閉じる</button>
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
                style={{width:'100%', height:'100px', padding:'10px', borderRadius:'10px', border:'1px solid #ddd', marginBottom:'15px', boxSizing:'border-box', fontFamily:'sans-serif', resize:'none'}}
            />
            <button onClick={postReview} style={{...styles.checkoutBtn, width:'100%'}}>送信する</button>
            <button onClick={() => setShowReviewModal(false)} style={{width:'100%', background:'none', border:'none', color:'#777', marginTop:'10px', cursor:'pointer'}}>キャンセル</button>
        </div>
    </div>
  );

  const UserMenu = () => (
    <div style={styles.userMenu}>
        <div style={{...styles.menuItem, borderBottom: isDark?'1px solid #444':'1px solid #eee', cursor:'default', fontWeight:'bold'}}>
            {discordUser.username}
        </div>
        <div onClick={toggleTheme} style={styles.menuItem}>
            {isDark ? '☀️ ライトモード' : '🌙 ダークモード'}
        </div>
        <div onClick={handleLogout} style={{...styles.menuItem, color:'#e74c3c'}}>
            🚪 ログアウト
        </div>
    </div>
  );

  const StatusDashboard = ({ order }: { order: any }) => {
    const isCompleted = order.status === 'completed';
    const isInProgress = order.status === 'in_progress' || order.status === 'pending'; // pendingも受付中として扱う
    const isScrubbed = order.status === 'scrubbed';
    
    // 配列か文字列か判定して表示用のリストを作成
    const serviceList = Array.isArray(order.services) 
        ? order.services 
        : (typeof order.services === 'string' ? order.services.split(',') : ['不明なサービス']);

    return (
        <div style={{...styles.card, border: `2px solid ${isCompleted ? '#4caf50' : isInProgress ? '#0071e3' : '#999'}`, background: isDark?'#222':'#fff', marginBottom: '30px'}}>
            <div style={{textAlign:'center', paddingBottom:'20px', borderBottom: isDark?'1px solid #444':'1px solid #eee'}}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>
                    {isCompleted ? '🎉' : isScrubbed ? '🗑️' : order.status === 'in_progress' ? '🔄' : '⏳'}
                </div>
                <h3 style={{fontSize:'20px', margin:0, color: isDark?'#fff':'#333'}}>
                    {isCompleted ? '作業完了' : isScrubbed ? 'データ抹消済み' : order.status === 'in_progress' ? '作業中' : '受付済み (作業待ち)'}
                </h3>
            </div>
            
            <div style={{padding:'20px 0'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <span style={{color:'#888'}}>注文番号</span>
                    <span style={{fontWeight:'bold', color: isDark?'#fff':'#333'}}>#{order.id}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <span style={{color:'#888'}}>金額</span>
                    <span style={{fontWeight:'bold', color:'#0071e3'}}>¥{order.totalPrice}</span>
                </div>
                <div style={{background: isDark?'#333':'#f9f9f9', padding:'10px', borderRadius:'8px', fontSize:'14px', color: isDark?'#ccc':'#555'}}>
                   {serviceList.map((s: string, i: number) => <div key={i}>• {s.trim()}</div>)}
                </div>
            </div>

            {/* 進行状況表示 */}
            {!isCompleted && !isScrubbed && (
                <div style={{marginTop:'10px'}}>
                     <div style={{height:'6px', background: isDark?'#444':'#eee', borderRadius:'3px', position:'relative', overflow:'hidden'}}>
                        <div style={{position:'absolute', left:0, top:0, bottom:0, width: order.status === 'in_progress' ? '66%' : '33%', background: order.status === 'in_progress' ? '#fbc02d' : '#0071e3', borderRadius:'3px', transition:'width 0.5s'}}></div>
                        <div style={{position:'absolute', left:0, top:0, bottom:0, width:'30%', background:'rgba(255,255,255,0.5)', animation:'loading 1.5s infinite'}}></div>
                    </div>
                    <style>{`@keyframes loading { 0% { left: 0; } 100% { left: 100%; } }`}</style>
                    <p style={{fontSize:'12px', color:'#888', textAlign:'center', marginTop:'10px'}}>
                        {order.status === 'pending' ? '担当者が確認中です。しばらくお待ちください。' : '現在作業中です。完了までお待ちください。'}
                    </p>
                </div>
            )}

            {isCompleted && (
                <div style={{textAlign:'center', marginTop:'10px'}}>
                    {order.proofImageUrl && (
                        <div style={{marginBottom: '15px'}}>
                            <p style={{fontSize:'14px', fontWeight:'bold', color: isDark?'#fff':'#333'}}>証拠画像</p>
                            <img src={order.proofImageUrl} alt="完了証拠" style={{maxWidth:'100%', maxHeight:'300px', borderRadius:'10px', border:'1px solid #ddd'}} />
                        </div>
                    )}
                    {!order.reviewPosted && (
                        <button onClick={() => setShowReviewModal(true)} style={{...styles.checkoutBtn, background:'#fbc02d', color:'#000', width:'100%'}}>
                            ✍️ 実績を投稿する
                        </button>
                    )}
                    {order.reviewPosted && (
                         <div style={{color: '#4caf50', fontWeight:'bold'}}>✅ 実績投稿済み</div>
                    )}
                </div>
            )}
        </div>
    );
  };

  // --- Render (Admin) ---
  if (isAdmin) {
    if (!isLoggedIn) return (
      <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh', background:'#121212', color:'#fff'}}>
        <h1>ADMIN LOGIN</h1>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'10px', borderRadius:'5px', border:'none', marginBottom:'10px', fontSize:'16px', background:'#333', color:'#fff', width: '200px'}} placeholder="Password" />
        <button onClick={() => refreshAdmin(password)} style={styles.checkoutBtn}>LOGIN</button>
      </div>
    );
    return (
      <div style={styles.adminContainer}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
          <h2 style={{margin:0}}>注文管理パネル</h2>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
             <span style={{fontSize:'12px', color:'#888'}}>User: {data?.orders?.length || 0}</span>
             <button onClick={()=>{setIsLoggedIn(false); localStorage.removeItem('admin_pw'); setPassword(''); setData(null);}} style={{background:'#cf6679', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer'}}>Logout</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:'15px'}}>
          {data?.orders?.map((o: any) => (
            <div key={o.id} style={styles.adminCard}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                <span style={{background:'#0071e3', padding:'2px 8px', borderRadius:'4px', fontSize:'12px', color:'#fff'}}>#{o.id}</span>
                <strong style={{color:'#fff'}}>{o.username}</strong>
                <span style={{color:'#03dac6', fontWeight:'bold'}}>¥{o.totalPrice}</span>
              </div>
              <div style={{fontSize:'12px', color:'#aaa', marginBottom:'5px'}}>
                <div>{new Date(o.createdAt || Date.now()).toLocaleString()}</div>
                <div style={{marginTop:'5px', fontWeight:'bold', color: o.status === 'completed' ? '#4caf50' : o.status === 'in_progress' ? '#fbc02d' : '#fff'}}>
                    Status: {o.status}
                </div>
              </div>
              <div style={{background:'#000', padding:'10px', borderRadius:'5px', fontFamily:'monospace', fontSize:'12px', wordBreak:'break-all', marginBottom:'10px', color:'#ccc'}}>
                ID: <span style={{color:'#fff', fontWeight:'bold', userSelect:'all'}}>{o.transferCode}</span><br/>
                PW: <span style={{color:'#fff', fontWeight:'bold', userSelect:'all'}}>{o.authPassword}</span>
              </div>
              <div style={{fontSize:'12px', marginBottom:'10px', padding:'8px', background:'rgba(255,255,255,0.05)', borderRadius:'5px', color:'#ddd'}}>
                {Array.isArray(o.services) ? o.services.join(', ') : o.services}
              </div>
              <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                {o.status === 'pending' && (
                     <button onClick={()=>adminAction(o.id, 'start')} style={{flex:1, background:'#fbc02d', color:'#000', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer', fontWeight:'bold'}}>開始</button>
                )}
                {o.status !== 'completed' && o.status !== 'scrubbed' && (
                    <>
                        <input type="file" id={`f-${o.id}`} style={{display:'none'}} onChange={(e)=>adminAction(o.id, 'complete', {image: e.target.files![0], userId: o.userId})} />
                        <button onClick={()=>document.getElementById(`f-${o.id}`)?.click()} style={{flex:1, background:'#4caf50', color:'#fff', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer', fontWeight:'bold'}}>完了(画像)</button>
                    </>
                )}
                <button onClick={()=>adminAction(o.id, 'scrub')} style={{flex:1, background:'#757575', border:'none', color:'#fff', borderRadius:'5px', padding:'8px', cursor:'pointer'}}>抹消</button>
                {o.paypayUrl && (
                    <button onClick={() => window.open(o.paypayUrl, '_blank')} style={{flex:1, background:'#fff', color:'#000', border:'none', borderRadius:'5px', padding:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'12px'}}>PayPay</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Render (User Dashboard) ---
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <h1 style={styles.headerTitle} onClick={()=>window.location.reload()}>WEI STATUS</h1>
        </div>
        
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            {!discordUser && (
                <button onClick={toggleTheme} style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer'}}>{isDark ? '☀️' : '🌙'}</button>
            )}
            {discordUser ? (
                <div style={{position:'relative'}}>
                    <img 
                        src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} 
                        alt="User" 
                        style={{width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', border: '2px solid #eee'}} 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    />
                    {showUserMenu && <UserMenu />}
                </div>
            ) : (
                <button onClick={handleDiscordLogin} style={{background:'#5865F2', color:'#fff', border:'none', padding:'8px 15px', borderRadius:'20px', fontSize:'13px', fontWeight:'bold', cursor:'pointer'}}>Login</button>
            )}
        </div>
      </header>

      <main style={styles.main}>
        {!discordUser ? (
            <div style={{textAlign:'center', marginTop:'80px'}}>
                 <h2 style={{fontSize:'28px', marginBottom:'10px', color: isDark?'#fff':'#333'}}>注文ステータス確認</h2>
                 <p style={{color:'#888', marginBottom:'40px'}}>Discordアカウントでログインして、現在の進行状況を確認できます。</p>
                 <div style={styles.loginBox} className="login-box">
                    <p style={{color:'#777', marginBottom:'30px', fontSize:'14px'}}>以下のアカウントで続行</p>
                    <button onClick={handleDiscordLogin} style={{...styles.checkoutBtn, width:'100%', background:'#5865F2', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', fontSize:'18px'}}>
                        <span>Discordでログイン</span>
                    </button>
                 </div>
            </div>
        ) : (
            <div>
                {/* 最新の注文状況 */}
                {activeOrder ? (
                    <StatusDashboard order={activeOrder} />
                ) : (
                    <div style={{...styles.card, textAlign:'center', color:'#888', padding:'40px'}}>
                        <div style={{fontSize:'40px', marginBottom:'10px'}}>📭</div>
                        <p>現在進行中の注文はありません</p>
                    </div>
                )}

                {/* 注文履歴リスト */}
                <h3 style={{color: isDark?'#fff':'#333', marginTop:'40px', fontSize:'18px', borderBottom: isDark?'1px solid #333':'1px solid #eee', paddingBottom:'10px'}}>📜 注文履歴</h3>
                {orderHistory.length > 0 ? (
                    <div style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px'}}>
                        {orderHistory.map(order => (
                            <div key={order.id} style={{background: isDark?'#222':'#fff', padding:'15px', borderRadius:'10px', border: isDark?'1px solid #333':'1px solid #eee'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                    <span style={{fontWeight:'bold', color: isDark?'#fff':'#333'}}>#{order.id}</span>
                                    <span style={{fontSize:'12px', color:'#888'}}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{fontSize:'14px', color: isDark?'#ccc':'#555', marginBottom:'5px'}}>
                                    {Array.isArray(order.services) ? order.services.join(', ') : order.services}
                                </div>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <span style={{color: order.status==='completed'?'#4caf50':order.status==='scrubbed'?'#999':'#0071e3', fontWeight:'bold', fontSize:'12px'}}>
                                        {order.status==='completed'?'完了':order.status==='scrubbed'?'抹消済':order.status==='in_progress'?'作業中':'受付'}
                                    </span>
                                    <span style={{color: isDark?'#fff':'#333'}}>¥{order.totalPrice}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{color:'#777', marginTop:'20px', textAlign:'center'}}>履歴はありません。</p>
                )}
            </div>
        )}
      </main>

      {showModal && <CustomModal message={modalMsg} onClose={() => { setShowModal(false); }} />}
      {showReviewModal && <ReviewModal />}
    </div>
  );
}




