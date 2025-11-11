import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navbar from './components/Navbar'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'


function App() {
const [user, setUser] = React.useState(null)
React.useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), [])


return (
<div>
<Navbar user={user} />
<div className="container my-3">
<Routes>
<Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
<Route path="/doc/:id" element={user ? <Editor user={user} /> : <Navigate to="/login" />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
</Routes>
</div>
</div>
)
}


export default App