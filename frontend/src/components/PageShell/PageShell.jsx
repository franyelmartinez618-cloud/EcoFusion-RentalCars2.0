import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import "./PageShell.css";

function PageShell({ children, className = "" }) {
    return (
        <div className={`page-shell ${className}`.trim()}>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
}

export default PageShell;
