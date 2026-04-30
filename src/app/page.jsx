import Home from '@/components/layout/Home'
import Navbar from '@/components/layout/Navbar'
import React from 'react'

export default function page() {
  return (
    <div className='bg-img'>
        <Navbar/>
        <Home/>
    </div>
  )
}
