"use client";

import { useEffect, useState } from "react";
import { scenarios } from "@/data/scenarios";

export default function GenerateCovers() {
  const [status, setStatus] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function processAll() {
      const borisImg = new Image();
      borisImg.src = "/images/boris-hero.png";
      await new Promise((resolve) => (borisImg.onload = resolve));

      const borisLogo = new Image();
      borisLogo.src = "/images/boris-logo.png";
      await new Promise((resolve) => (borisLogo.onload = resolve));

      const log: string[] = [];

      for (const scenario of scenarios) {
        // Keep AI generated full images for alphabet, colors, numbers, animals
        const skipAI = ["alphabet", "colors", "numbers", "animals"];
        if (skipAI.includes(scenario.slug)) {
          log.push(`Skipped ${scenario.slug} (using AI generated version)`);
          setStatus([...log]);
          continue;
        }

        const bgImg = new Image();
        bgImg.src = `/images/lunathecat/scene-${scenario.slug}.png`;
        await new Promise((res) => {
          bgImg.onload = res;
          bgImg.onerror = res;
        });

        const canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // 1. Draw background
        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        } else {
          const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grad.addColorStop(0, "#0f1f3a");
          grad.addColorStop(1, "#152347");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 2. Dark bottom gradient overlay
        const overlay = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height);
        overlay.addColorStop(0, "rgba(10, 22, 40, 0.1)");
        overlay.addColorStop(1, "rgba(10, 22, 40, 0.7)");
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Draw Boris Mascot Badge (Circular Sticker on Bottom-Right)
        ctx.save();
        const badgeX = canvas.width - 100;
        const badgeY = canvas.height - 100;
        const badgeR = 75;

        // Outer Glow & Shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;

        // Outer Gold/Cyan Ring
        ctx.fillStyle = "#4fc3f7";
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR + 6, 0, Math.PI * 2);
        ctx.fill();

        // White Border
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR + 3, 0, Math.PI * 2);
        ctx.fill();

        // Clip Circle for Boris Face/Mascot
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeR, 0, Math.PI * 2);
        ctx.clip();

        // Draw Boris Logo/Face
        ctx.drawImage(borisLogo, badgeX - badgeR, badgeY - badgeR, badgeR * 2, badgeR * 2);
        ctx.restore();

        // 4. Draw Scenario Title Badge on top-left
        ctx.save();
        ctx.fillStyle = "rgba(10, 22, 40, 0.88)";
        ctx.beginPath();
        ctx.roundRect(24, 24, 320, 58, 18);
        ctx.fill();
        ctx.strokeStyle = "rgba(79, 195, 247, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = "600 22px Fredoka, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${scenario.icon} ${scenario.titleEn}`, 42, 60);
        ctx.restore();

        // 5. Save canvas to server
        const base64 = canvas.toDataURL("image/png");
        try {
          const res = await fetch("/api/save-cover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: scenario.slug, base64 }),
          });
          const data = await res.json();
          if (data.success) {
            log.push(`✅ Cover updated for ${scenario.slug}`);
          } else {
            log.push(`❌ Error saving ${scenario.slug}: ${data.error}`);
          }
        } catch (e) {
          log.push(`❌ Fetch error ${scenario.slug}: ${String(e)}`);
        }

        setStatus([...log]);
      }

      setDone(true);
    }

    processAll();
  }, []);

  return (
    <div style={{ padding: "3rem", background: "#0a1628", color: "#fff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <h1>Generating Boris Scenario Cover Photos...</h1>
      <p>{done ? "🎉 ALL COVERS GENERATED & SAVED SUCCESSFULLY!" : "Processing scenarios..."}</p>
      <ul>
        {status.map((item, index) => (
          <li key={index} style={{ margin: "0.5rem 0", fontSize: "1.1rem" }}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
