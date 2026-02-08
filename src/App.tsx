import React, { useState, useEffect } from 'react';

export default function App() {
  const [data, setData] = useState<any>(null);
  const [password, setPassword] = useState(localStorage.getItem('admin_pw') || '');
  const isAdmin = window.location.hostname.startsWith('admin.');

  const refresh = () => fetch('/api/admin/stats', { headers: { 'Authorization': password } }).then(res => res.json()).then(setData);

  const handleComplete = async (orderId: number, userId: string) => {
    const fileInput = document.getElementById(`file-${orderId}`) as HTMLInputElement;
    if (!fileInput.files?.[0]) return alert("スクショを選択してください");

    const formData = new FormData();
    formData.append('id', orderId.toString());
    formData.append('userId', userId);
    formData.append('image', fileInput.files[0]);

    await fetch('/api/admin/complete', {
      method: 'POST',
      headers: { 'Authorization': password },
      body: formData
    });
    alert("完了通知を送信しました！");
    refresh();
  };

  if (isAdmin) {
    return (
      <div style={{background:'#111', color:'#fff', minHeight:'100vh', padding:'20px'}}>
        {data?.orders?.map((o: any) => (
          <div key={o.id} style={{background:'#222', padding:'20px', borderRadius:'15px', marginBottom:'15px'}}>
            <h3>#{o.id} {o.username}</h3>
            <p>Code: {o.transferCode} / Pass: {o.authPassword}</p>
            <input type="file" id={`file-${o.id}`} accept="image/*" style={{marginBottom:'10px'}} />
            <button onClick={() => handleComplete(o.id, o.userId)} style={{background:'#009944', color:'#fff', padding:'10px', borderRadius:'8px', border:'none', cursor:'pointer'}}>スクショ送付 & 完了通知</button>
          </div>
        ))}
      </div>
    );
  }

  return <div>ユーザー向け案内画面...</div>;
}
