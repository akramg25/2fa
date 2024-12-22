import { NavLink } from 'react-router-dom';
import NavLinks from './NavLinks';

function NavBar() {
    return (
        <div className="container">
            <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
                <NavLink to={"/"} className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none">
                    <span className="fs-4">Demo</span>
                </NavLink>
                <NavLinks />
            </header>
        </div>
    );
}

export default NavBar;