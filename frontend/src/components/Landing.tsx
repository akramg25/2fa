import { Link } from "react-router-dom";

export default function landing() {
    return (
        <section className="container">
            <div className="jumbotron jumbotron-fluid mb-0">
                <div className="container">
                    <div className="row justify-content-center text-center">
                        <div className="col-md-10 col-lg-6">
                            <h1 className="display-5">The Coolest User Auth I have ever made</h1>
                            <p className="lead">
                                Use the navbar to access the Sign Up or Log In page and experience 2FA like never before.
                                <br />
                                Or simply press the gigantic get-started button below.
                            </p>
                            <p className="lead">
                                <Link className="btn btn-primary btn-lg" to="/signin">Get Started</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section >
    )
}