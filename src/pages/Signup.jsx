import React from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate, Link } from 'react-router-dom'


export default function Signup() {
const [email, setEmail] = React.useState('')
const [password, setPassword] = React.useState('')
const nav = useNavigate()


const submit = async (e) => {
e.preventDefault()
try {
await createUserWithEmailAndPassword(auth, email, password)
nav('/')
} catch (err) {
alert(err.message)
}
}


return (
<div className="row justify-content-center">
<div className="col-12 col-md-6">
<h3>Sign up</h3>
<form onSubmit={submit}>
<div className="mb-3">
<label className="form-label">Email</label>
<input className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
</div>
<div className="mb-3">
<label className="form-label">Password</label>
<input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
</div>
<button className="btn btn-primary">Create account</button>
</form>
<p className="mt-2">Have an account? <Link to="/login">Login</Link></p>
</div>
</div>
)
}