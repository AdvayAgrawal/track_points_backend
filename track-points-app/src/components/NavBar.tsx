import { FC } from "react"
import { Link } from "react-router-dom"

export const NavBar: FC = () => {
  return (
    <div className='navbar'>
      <div className='navbar-item home-logo'><Link className='navbar-link' to='/'>Home</Link></div>
      <div className='navbar-item'><Link className='navbar-link' to='/dashboard'>Dashboard</Link></div>
      <div className='navbar-item'><Link className='navbar-link' to='/targets'>Targets</Link></div>
      <div className='navbar-item profile'><Link className='navbar-link' to='#'>Profile</Link></div>
    </div>
  )
}