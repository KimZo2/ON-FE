import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './header.css'

const Header = () => {
  return (
    
    <div className="headers">
        <Link href="/" className="logo">ON</Link>
        <Link href="/login" className="login">login</Link>
    </div>

  )
}

export default Header