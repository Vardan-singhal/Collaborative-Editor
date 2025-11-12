import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
// import { Moon, Sun } from "lucide-react";

export default function LandingPage() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

//   const toggleTheme = () => {
//     setTheme(theme === "light" ? "dark" : "light");
//   };

  const features = [
    {
      title: "Real-Time Collaboration",
      desc: "Work together with multiple users simultaneously with live updates powered by WebSockets or Firestore listeners.",
      icon: "🤝",
    },
    {
      title: "Role-Based Access Control",
      desc: "Manage permissions easily—owner, editor, and viewer roles ensure secure collaboration.",
      icon: "🔐",
    },
    {
      title: "Auto Save & Version Sync",
      desc: "Every change is saved automatically in real time, ensuring you never lose your progress.",
      icon: "💾",
    },
    {
      title: "Document Management",
      desc: "Create, edit, rename, or delete documents right from your dashboard.",
      icon: "🗂️",
    },
    {
      title: "Responsive Design",
      desc: "Fully responsive layout optimized for desktops, tablets, and mobile devices.",
      icon: "📱",
    },
    {
      title: "Dark / Light Mode",
      desc: "Easily switch between light and dark themes to suit your environment.",
      icon: "🌗",
    },
  ];

  return (
    <div>
      

      {/* ✅ Hero Section */}
      <section className="text-center py-5 bg-light">
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">
            Collaborate, Edit, and Share in Real Time 🚀
          </h1>
          <p className="lead text-muted mb-4">
            CollabWrite lets you and your team create, edit, and manage
            documents in real-time — securely and seamlessly.
          </p>
          <a href="/signup" className="btn btn-primary btn-lg">
            Get Started
          </a>
        </div>
      </section>

      {/* ✅ Features Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-4">Key Features</h2>
          <div className="row g-4">
            {features.map((f, idx) => (
              <div key={idx} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 border-0 shadow-sm p-3 text-center"
                  style={{ borderRadius: "1rem" }}
                >
                  <div
                    className="display-5 mb-3"
                    style={{ fontSize: "2.5rem" }}
                  >
                    {f.icon}
                  </div>
                  <h5 className="fw-bold mb-2">{f.title}</h5>
                  <p className="text-muted small">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-body-secondary py-3 mt-5 text-center">
        <div className="container">
          <p className="mb-1">
            &copy; {new Date().getFullYear()} CollabWrite. All rights reserved.
          </p>
          <p className="text-muted small mb-0">
            Built with ❤️ using React, Firebase, and Bootstrap.
          </p>
        </div>
      </footer>
    </div>
  );
}
