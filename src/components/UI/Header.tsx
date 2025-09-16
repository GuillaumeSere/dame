import React from 'react'
export default function Header() {
  return (
    <header style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex',justifyContent: 'center', padding: '8px 16px', background: 'linear-gradient(90deg,#222,#0000)', color: '#fff', fontFamily: 'sans-serif', boxShadow: '0 2px 4px #0008' }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Dames 3D</div>
      <div />
    </header>
  )
}
