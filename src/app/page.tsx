"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { scenarios } from "@/data/scenarios";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className={`header ${scrolled ? "scrolled" : ""}`} id="app-header">
        <div className="header-inner">
          <Link href="/" className="logo" id="logo-link">
            <Image
              src="/images/boris-logo.png"
              alt="Boris the Dog"
              width={42}
              height={42}
              className="logo-icon"
            />
            <span className="logo-text">
              Learn with Boris
              <span className="logo-tagline">Inglês com o Boris</span>
            </span>
          </Link>
          <div className="lang-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
            EN / PT
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero-badge">
            <span>🐾</span>
            Plataforma Gratuita de Inglês
          </div>
          <h1 className="hero-title">
            Aprenda Inglês com o seu amigo{" "}
            <span className="hero-title-accent">Boris</span>
          </h1>
          <p className="hero-subtitle">
            Pratique vocabulário e frases com cenários reais do cotidiano.
            Flashcards interativos, quizzes gamificados e jogos divertidos com o
            Boris! 🐶✨
          </p>
          <div className="hero-image-wrapper">
            <Image
              src="/images/boris-banner.png"
              alt="Boris the Shih Tzu learning English with books and ABC letters"
              fill
              style={{ objectFit: "cover" }}
              priority
              sizes="(max-width: 768px) 100vw, 700px"
            />
          </div>
        </section>

        {/* SCENARIOS GRID */}
        <div className="main-content">
          <div className="section-header">
            <h2 className="section-header-title">
              <svg
                className="section-header-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Escolha um Cenário
            </h2>
            <p className="section-header-subtitle">
              Choose a scenario to practice
            </p>
          </div>

          <div className="scenarios-grid">
            {scenarios.map((scenario, index) => (
              <Link
                key={scenario.slug}
                href={`/scenario/${scenario.slug}`}
                className="scenario-card-wrapper"
                id={`card-${scenario.slug}`}
              >
                <div
                  className={`scenario-card ${scenario.cardColor}`}
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  <div className="card-image-wrapper">
                    <Image
                      src={`/images/scenarios/${scenario.slug}.png`}
                      alt={scenario.titleEn}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="card-body">
                    <div className="card-icon-wrapper">
                      <div className="card-icon-circle">{scenario.icon}</div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{scenario.titleEn}</h3>
                      <p className="card-title-pt">{scenario.titlePt}</p>
                      <p className="card-description">
                        {scenario.description}
                      </p>
                    </div>
                    <div className="card-footer">
                      <span className="card-badge">
                        Começar
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="card-accent-bar" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-encouragement">
            <svg
              className="footer-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            </svg>
            You&apos;re doing great! Keep practicing!
          </p>
          <p className="footer-encouragement-pt">
            Você está indo muito bem! Continue praticando!
          </p>
          <p className="footer-credits">
            Made with{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="heart"
            >
              <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
            </svg>{" "}
            by Learn with Boris · Inglês com o Boris
          </p>
        </div>
      </footer>
    </>
  );
}
