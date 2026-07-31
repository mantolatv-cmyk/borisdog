import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn with Boris — Inglês com o Boris 🐶",
  description:
    "Plataforma interativa e gamificada para aprender inglês com o Boris, seu melhor amigo Shih Tzu! Cenários, flashcards, quizzes e jogos divertidos.",
  authors: [{ name: "Learn with Boris" }],
  keywords: [
    "aprender inglês",
    "inglês para crianças",
    "Boris o cachorro",
    "English for kids",
    "jogos de inglês",
    "flashcards inglês",
    "quiz inglês",
  ],
  openGraph: {
    title: "Learn with Boris — Inglês com o Boris 🐶",
    description:
      "Aprenda inglês com cenários reais e jogos divertidos ao lado do Boris!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
