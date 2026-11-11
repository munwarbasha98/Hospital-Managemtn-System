import Navbar from "./Navbar.jsx";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content-wrap">{children}</main>
      <footer>
        CarePoint Hospital System • Advancing SDG 3: Good Health & Well-being
      </footer>
    </div>
  );
}
