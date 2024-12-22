import {NavLink, useNavigate} from "react-router-dom";
import {clearUser, getAuthToken, userIsAuthenticated} from "../../utils/auth.ts";
import $fetch from "../../utils/fetch.ts";

export default function NavLinks() {
    const navigate = useNavigate()
    function signout() {
        $fetch('/api/signout', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`
            }
        }).then(() => {
            clearUser()
            navigate('/')
        })
    }

    return (
        <ul className="nav">
            <li className="nav-item"><NavLink to={'/'} className="nav-link">Home</NavLink></li>
            <li className="nav-item"><NavLink to={'/profile'} className="nav-link">Profile</NavLink></li>
            {userIsAuthenticated() ? (
                <li className="nav-item">
                    <button className="btn btn-outline-primary" onClick={signout}>Sign Out</button>
                </li>
            ) : (
                <div className="d-flex gap-2">
                    <li className="nav-item"><NavLink to={'/signin'} className="btn btn-success">Sign In</NavLink></li>
                    <li className="nav-item"><NavLink to={'/signup'} className="btn btn-primary">Sign Up</NavLink></li>
                </div>
            )}
        </ul>
    )
}