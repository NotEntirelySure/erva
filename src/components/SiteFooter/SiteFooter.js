import React from 'react';
export default function SiteFooter() {
  return (
    <div style={
      {
        position:'fixed',
        marginBottom:'1rem',
        bottom:0,
        width:'100vw',
        zIndex:-1
      }
    }>
      <div style={{display:'flex',justifyContent:'center'}}><p>Erva Systems &#169; 2023</p></div>
    </div>
  )
}