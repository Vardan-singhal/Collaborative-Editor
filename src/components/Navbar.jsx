import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'


export default function Navbar({ user }) {
const nav = useNavigate()
const logout = async () => {
await signOut(auth)
nav('/login')
}


return (
<nav className="navbar navbar-expand-lg navbar-light bg-light">
<div className="container-fluid">
<Link className="navbar-brand" to="/">DocsClone</Link>
<div className="collapse navbar-collapse">
<ul className="navbar-nav ms-auto">
{user ? (
<>
<li className="nav-item"><span className="nav-link">{user.email}</span></li>
<li className="nav-item"><button className="btn btn-outline-secondary" onClick={logout}>Sign out</button></li>
</>
) : (
<>
<li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
<li className="nav-item"><Link className="nav-link" to="/signup">Sign up</Link></li>
</>
)}
</ul>
</div>
</div>
</nav>
)
}