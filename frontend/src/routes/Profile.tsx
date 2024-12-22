import {useState, useEffect, FormEvent} from "react";
import '../assets/css/profile.css'
import {type User} from "../utils/user.ts";
import {useNavigate} from "react-router-dom";
import $fetch from "../utils/fetch.ts";
import {getAuthToken, clearUser, setAuthCookie} from "../utils/auth.ts";

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    if (!getAuthToken()) navigate("/signin");

    useEffect(() => {
        const token = getAuthToken();
        if (!token) navigate("/signin")

        $fetch("/api/user/me", {
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`
            }
        }).then((res) => {
            if (res) {
                setUser(res)
                setAuthCookie(res.token)
            } else {
                clearUser()
                navigate("/signin")
            }
        }).catch(console.error)
    }, [navigate])

    function submitUpdate(e: FormEvent) {
        e.preventDefault()
        $fetch<User>('/api/user/update', {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`,
            },
            body: user
        }).then((res) => {
            if (user && res.email) {
                setUser(res)
                setAuthCookie(res.token)
                alert("Profile updated successfully")
            }
        }).catch(() => {
            alert("An error occurred while updating profile")
        })
    }

    function updateImage() {
        alert("This feature is not yet implemented")
    }

    return (
        <div className="container-xl px-4 mt-4">
            <div className="row">
                <div className="col-xl-4">
                    <div className="card mb-4 mb-xl-0">
                        <div className="card-header">Profile Picture</div>
                        <form className="card-body text-center" onSubmit={updateImage}>
                            <img className="img-account-profile rounded-circle mb-2"
                                 src="/images/profile-placeholder.jpg"
                                 alt="Profile Pic"/>

                            <div className="small font-italic text-muted mb-4">JPG or PNG no larger than 5 MB</div>
                            <input type="file" className="form-control" name="pic"/>
                            <button className="btn btn-primary mt-3" type="submit">Upload new image</button>
                        </form>
                    </div>
                </div>
                <div className="col-xl-8">
                    <div className="card mb-4">
                        <div className="card-header">Account Details</div>
                        <div className="card-body">
                            <form>
                                <div className="mb-3">
                                    <label className="small mb-1" htmlFor="inputEmail">Email</label>
                                    <input className="form-control" id="inputEmail" type="text"
                                           value={user?.email || ""}
                                           disabled={true}/>
                                </div>
                                <div className="mb-3">
                                    <label className="small mb-1" htmlFor="inputPhone">Phone</label>
                                    <input className="form-control" id="inputPhone" type="tel"
                                           value={user?.phone || ""}
                                           onChange={(e) => setUser({...user, phone: e.target.value} as User)}
                                           name="phone"/>
                                </div>
                                <div className="row gx-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="small mb-1" htmlFor="gender">Gender</label>
                                        <select name="gender" id="gender" className="form-control"
                                                defaultValue={user?.gender}
                                                onChange={(e) => setUser({...user, gender: e.target.value} as User)}>
                                            <option disabled>Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Non-Binary">
                                                Non Binary
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="small mb-1" htmlFor="dobPicker">Date of Birth</label>
                                        <input className="form-control" type="date" name="dob" id="dobPicker"
                                               value={user?.dob || ""}
                                               onChange={(e) => setUser({...user, dob: e.target.value} as User)}/>
                                    </div>
                                </div>
                                <button className="btn btn-primary" onClick={submitUpdate}>Update</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}