import React, {useState} from 'react';
import '../assets/css/form.css'
import $fetch from '../utils/fetch.ts';
import {useNavigate} from "react-router-dom";
import {storeUser, type User} from "../utils/user.ts";
import {setAuthCookie} from "../utils/auth.ts";

const SignUpForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    function validateEmail(email: string): boolean {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    function checkPassword(): boolean {
        return password === confirmPassword;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            document.getElementById('errors')!.innerText = 'Invalid email.';
            return;
        }

        $fetch<User>('/api/signup', {
            method: 'POST',
            body: {
                email,
                password
            },
            onResponseError({response}): Promise<void> | void {
                console.log('Response error:', response);
                if (response.status === 409) {
                    document.getElementById('errors')!.innerText = 'User with that email already exists.';
                }
            }
        }).then((res) => {
            storeUser(res)
            setAuthCookie(res.token)
            alert('Account created.');
            navigate('/profile');
        }).catch((err) => {
            console.error('Error:', err);
        });
    }


    return (
        <form onSubmit={handleSubmit}>
            <div className="container">
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="email" aria-describedby="emailHelp"
                           onChange={e => setEmail(e.target.value)}/>
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="password" className="form-control" id="password"
                           onChange={e => setPassword(e.target.value)}/>
                </div>
                <div className="mb-1">
                    <label htmlFor="password_2" className="form-label">Password Again</label>
                    <input type="password" className="form-control" id="password_2" onChange={e => {
                        setConfirmPassword(e.target.value)
                        if (checkPassword()) {
                            document.getElementById('errors')!.innerText = 'Passwords do not match.';
                        } else {
                            document.getElementById('errors')!.innerText = '';
                        }
                    }}/>
                </div>
                <small id="errors" className="form-text text-danger"></small>
                <div className="mt-3">
                    <button type="submit" className="btn btn-primary">Submit</button>
                </div>
            </div>
        </form>
    );
};

export default SignUpForm;
