import Footer from "./ui/Footer";
import NavBar from "./ui/Nav";
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <NavBar />
            <div>
                {children}
            </div>
            <Footer />
        </main>
    );
}