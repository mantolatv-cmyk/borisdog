"use client";

import { use, useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getScenarioBySlug, type VocabItem, type ScenarioData } from "@/data/scenarios";
import { notFound } from "next/navigation";
import * as LucideIcons from "lucide-react";

// ================================================
// Boris Reaction Component
// ================================================
function BorisReaction({
  message,
  emoji,
  show,
}: {
  message: string;
  emoji: string;
  show: boolean;
}) {
  if (!show) return null;
  return (
    <div className="boris-reaction" key={message}>
      <span className="boris-reaction-emoji">{emoji}</span>
      <span className="boris-reaction-text">{message}</span>
    </div>
  );
}

// ================================================
// Tab: Story Time
// ================================================
function StoryTab({ scenario }: { scenario: ScenarioData }) {
  const [visibleCount, setVisibleCount] = useState(1);
  const [showPt, setShowPt] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(1);
    setShowPt({});
  }, [scenario.slug]);

  const addNext = () => {
    if (visibleCount < scenario.dialogues.length) {
      setVisibleCount((prev) => prev + 1);
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  const restart = () => {
    setVisibleCount(1);
    setShowPt({});
  };

  const isComplete = visibleCount >= scenario.dialogues.length;

  return (
    <>
      <div className="dialogue-container" ref={containerRef}>
        {scenario.dialogues.slice(0, visibleCount).map((d, idx) => (
          <div
            key={idx}
            className={`dialogue-bubble ${d.speaker} visible ${showPt[idx] ? "show-pt" : ""}`}
            onClick={() =>
              setShowPt((prev) => ({ ...prev, [idx]: !prev[idx] }))
            }
          >
            <div className="dialogue-speaker">
              <span>{d.speaker === "boris" ? "🐶" : "👦"}</span>
              <span>
                {d.speaker === "boris" ? "Boris the Dog" : "Little Friend"}
              </span>
            </div>
            <div className="dialogue-english">{d.en}</div>
            <div className="dialogue-portuguese">🇧🇷 {d.pt}</div>
          </div>
        ))}
      </div>
      <button
        className="dialogue-next-btn"
        onClick={addNext}
        disabled={isComplete}
      >
        {isComplete ? "✅ Story Complete!" : "Next Line →"}
      </button>
      {isComplete && (
        <button className="dialogue-restart-btn visible" onClick={restart}>
          🔄 Start Over
        </button>
      )}
    </>
  );
}

// ================================================
// Tab: Vocabulary (Word Garden)
// ================================================
function getLucideIcon(word: string) {
  const formatted = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
  const iconKey = Object.keys(LucideIcons).find(
    (key) => key.toLowerCase() === formatted
  );
  if (iconKey) {
    const Icon = (LucideIcons as any)[iconKey];
    return <Icon size={80} strokeWidth={1.5} />;
  }
  // Fallback to Image icon if exact word doesn't match a Lucide icon
  return <LucideIcons.Image size={80} strokeWidth={1.5} />;
}

function VocabTab({ scenario }: { scenario: ScenarioData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [complete, setComplete] = useState(false);

  const total = scenario.vocabulary.length;

  const nextWord = () => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 < total) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setComplete(true);
      }
    }, 200);
  };

  const restart = () => {
    setComplete(false);
    setCurrentIndex(0);
    setFlipped(false);
  };

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🌱</div>
        <h2 className="game-complete-title">Garden Complete!</h2>
        <p className="game-complete-score">
          You reviewed all {total} words! Boris is proud! 🐶⭐
        </p>
        <div className="game-stars">⭐⭐⭐</div>
        <button className="game-replay-btn" onClick={restart}>
          🔄 Review Again
        </button>
      </div>
    );
  }

  const v = scenario.vocabulary[currentIndex];
  // Determine text to show on back
  const displayWordEn = v.wordEn || v.word;

  return (
    <div className="flashcard-container">
      <div className="game-score" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
        ⭐ Word: <strong>{currentIndex + 1}</strong> / <span>{total}</span>
      </div>
      
      <div
        className={`vocab-card large-flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <div className="vocab-card-inner">
          <div
            className="vocab-card-front"
            style={v.hex ? { borderBottom: `6px solid ${v.hex}` } : undefined}
          >
            <div className="vocab-emoji" style={{ color: "var(--accent-primary)", display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              {getLucideIcon(v.word)}
            </div>
            <div className="vocab-word" style={{ fontSize: '2.5rem' }}>{v.pt}</div>
            <div className="vocab-hint">
              tap to flip for English
            </div>
          </div>
          <div
            className="vocab-card-back"
            style={
              v.hex
                ? {
                    background: `linear-gradient(135deg, ${v.hex}22, ${v.hex}11)`,
                    border: `4px solid ${v.hex}44`,
                  }
                : undefined
            }
          >
            <div className="vocab-emoji" style={{ color: "var(--accent-primary)", display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              {getLucideIcon(v.word)}
            </div>
            <div className="vocab-word" style={{ fontSize: '3rem', color: 'var(--accent-primary)' }}>{displayWordEn}</div>
            <div className="vocab-hint">
              {v.sound || "English"}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flashcard-controls" style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          className="game-replay-btn" 
          onClick={nextWord}
          style={{ marginTop: '2.5rem', minWidth: '220px', padding: '1rem 2rem', fontSize: '1.2rem' }}
        >
          {currentIndex + 1 === total ? "Finish 🎉" : "Next Word ➡️"}
        </button>
      </div>
    </div>
  );
}

// ================================================
// Tab: Quiz (Play & Learn)
// ================================================
function QuizTab({ scenario }: { scenario: ScenarioData }) {
  const [questions] = useState(() => {
    return [...scenario.vocabulary]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(10, scenario.vocabulary.length));
  });
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);
  const [borisMsg, setBorisMsg] = useState("");
  const [showBoris, setShowBoris] = useState(false);

  const total = questions.length;

  const getOptions = useCallback(
    (correctWord: string) => {
      const allWords = scenario.vocabulary.map((v) => v.word);
      const wrong = allWords
        .filter((w) => w !== correctWord)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      return [...wrong, correctWord].sort(() => Math.random() - 0.5);
    },
    [scenario.vocabulary]
  );

  const [options, setOptions] = useState(() =>
    questions.length > 0 ? getOptions(questions[0].word) : []
  );

  const handleAnswer = (opt: string) => {
    if (answered) return;
    setAnswered(true);
    setSelected(opt);
    const correct = questions[qIndex].word;

    if (opt === correct) {
      setScore((s) => s + 1);
      setBorisMsg("🎉 Correct! Boris is proud! 🐶");
    } else {
      setBorisMsg(`❌ It's ${correct}! Keep trying! 🐶`);
    }
    setShowBoris(true);
    setTimeout(() => setShowBoris(false), 3000);

    setTimeout(() => {
      if (qIndex + 1 < total) {
        setQIndex((q) => q + 1);
        setAnswered(false);
        setSelected(null);
        setOptions(getOptions(questions[qIndex + 1].word));
      } else {
        setComplete(true);
      }
    }, 1500);
  };

  const replay = () => {
    questions.sort(() => Math.random() - 0.5);
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setSelected(null);
    setComplete(false);
    setOptions(getOptions(questions[0].word));
  };

  if (complete) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">
          {pct >= 90 ? "🏆" : pct >= 60 ? "🎉" : "💪"}
        </div>
        <h2 className="game-complete-title">
          {pct >= 90
            ? "Amazing! Boris is so happy!"
            : pct >= 60
              ? "Great job!"
              : "Nice try!"}
        </h2>
        <p className="game-complete-score">
          You got {score} out of {total} correct! ({pct}%)
        </p>
        <div className="game-stars">
          {pct >= 90 ? "⭐⭐⭐" : pct >= 60 ? "⭐⭐" : "⭐"}
        </div>
        <button className="game-replay-btn" onClick={replay}>
          🔄 Play Again!
        </button>
      </div>
    );
  }

  const q = questions[qIndex];
  const prompt = q.hex ? (
    <div
      className="color-display"
      style={{ backgroundColor: q.hex }}
    />
  ) : q.sound ? (
    <span style={{ fontSize: "2rem" }}>🐶 &quot;{q.sound}&quot;</span>
  ) : (
    <span style={{ fontSize: "3rem" }}>{q.emoji}</span>
  );

  return (
    <>
      <div className="game-area">
        <div className="game-score">
          ⭐ Score: <strong>{score}</strong> / <span>{total}</span>
        </div>
        <div className="game-progress">
          <div
            className="game-progress-bar"
            style={{ width: `${(qIndex / total) * 100}%` }}
          />
        </div>
        <div className="game-prompt">
          <div className="game-prompt-label">
            {scenario.gamePromptLabel || "What is this?"}
          </div>
          <div className="game-prompt-content">{prompt}</div>
        </div>
        <div className="game-options">
          {options.map((opt) => {
            let cls = "game-option";
            if (answered) {
              cls += " disabled";
              if (opt === q.word) cls += " correct";
              else if (opt === selected) cls += " wrong";
            }
            return (
              <button
                key={opt}
                className={cls}
                onClick={() => handleAnswer(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>
        <div
          className={`game-feedback ${answered ? (selected === q.word ? "correct-msg" : "wrong-msg") : ""}`}
        >
          {answered
            ? selected === q.word
              ? "🎉 Correct! Boris is proud!"
              : `❌ That's ${q.word}!`
            : ""}
        </div>
      </div>
      <BorisReaction
        message={borisMsg}
        emoji={selected === q.word ? "🎉🐶" : "🤔🐶"}
        show={showBoris}
      />
    </>
  );
}

// ================================================
// Tab: Memory / Matching Pairs
// ================================================
function MemoryTab({ scenario }: { scenario: ScenarioData }) {
  const [cards, setCards] = useState<
    { word: string; display: string; type: "emoji" | "word"; id: number }[]
  >([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [complete, setComplete] = useState(false);

  const initGame = useCallback(() => {
    const numPairs = Math.min(10, scenario.vocabulary.length);
    const items = [...scenario.vocabulary]
      .sort(() => Math.random() - 0.5)
      .slice(0, numPairs);
    const allCards: typeof cards = [];
    items.forEach((item, i) => {
      allCards.push({
        word: item.word,
        display: item.emoji,
        type: "emoji",
        id: i * 2,
      });
      allCards.push({
        word: item.word,
        display: item.word,
        type: "word",
        id: i * 2 + 1,
      });
    });
    setCards(allCards.sort(() => Math.random() - 0.5));
    setFlippedIds([]);
    setMatchedWords([]);
    setLock(false);
    setComplete(false);
  }, [scenario.vocabulary]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleCardClick = (cardId: number, word: string) => {
    if (lock || flippedIds.includes(cardId) || matchedWords.includes(word))
      return;

    const newFlipped = [...flippedIds, cardId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setLock(true);
      const [first, second] = newFlipped;
      const card1 = cards.find((c) => c.id === first);
      const card2 = cards.find((c) => c.id === second);

      if (card1 && card2 && card1.word === card2.word) {
        setTimeout(() => {
          setMatchedWords((prev) => {
            const next = [...prev, card1.word];
            if (
              next.length >= Math.min(10, scenario.vocabulary.length)
            ) {
              setTimeout(() => setComplete(true), 600);
            }
            return next;
          });
          setFlippedIds([]);
          setLock(false);
        }, 600);
      } else {
        setTimeout(() => {
          setFlippedIds([]);
          setLock(false);
        }, 1000);
      }
    }
  };

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🎉</div>
        <h2 className="game-complete-title">You Found All Pairs!</h2>
        <p className="game-complete-score">
          Boris is so proud of you! 🐶⭐
        </p>
        <div className="game-stars">⭐⭐⭐</div>
        <button className="game-replay-btn" onClick={initGame}>
          🔄 Play Again!
        </button>
      </div>
    );
  }

  const totalPairs = Math.min(10, scenario.vocabulary.length);

  return (
    <div className="memory-game-container">
      <div className="memory-header">
        <div className="memory-progress">
          <span>🃏 Pairs Found: <strong>{matchedWords.length} / {totalPairs}</strong></span>
        </div>
        <button className="memory-reset-btn" onClick={initGame} title="Restart Game">
          🔄 Reset
        </button>
      </div>
      <div className="pairs-board">
        {cards.map((card, index) => {
          const isFlipped =
            flippedIds.includes(card.id) || matchedWords.includes(card.word);
          const isMatched = matchedWords.includes(card.word);
          return (
            <div
              key={card.id}
              className={`pairs-card ${isFlipped ? "flipped" : ""} ${isMatched ? "matched" : ""}`}
              onClick={() => handleCardClick(card.id, card.word)}
            >
              <div className="pairs-card-inner">
                <div className="pairs-front">{index + 1}</div>
                <div
                  className="pairs-back"
                  style={{ flexDirection: "column", justifyContent: "center" }}
                >
                  {card.type === "emoji" ? (
                    <div className="pairs-emoji">{card.display}</div>
                  ) : (
                    <div className="pairs-word">{card.display}</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================================================
// Tab: Feed Boris
// ================================================
function FeedBorisTab({ scenario }: { scenario: ScenarioData }) {
  const [items, setItems] = useState<VocabItem[]>([]);
  const [fed, setFed] = useState(0);
  const [feedback, setFeedback] = useState("Drag items to feed Boris! 🐶");
  const [borisEmoji, setBorisEmoji] = useState("🐶");
  const [dragOver, setDragOver] = useState(false);
  const [complete, setComplete] = useState(false);
  const total = scenario.vocabulary.length;

  const initGame = useCallback(() => {
    setItems(
      [...scenario.vocabulary].sort(() => Math.random() - 0.5)
    );
    setFed(0);
    setFeedback("Drag items to feed Boris! 🐶");
    setBorisEmoji("🐶");
    setComplete(false);
  }, [scenario.vocabulary]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const eatItem = (word: string) => {
    setItems((prev) => prev.filter((i) => i.word !== word));
    const newFed = fed + 1;
    setFed(newFed);
    setBorisEmoji("😋");
    setFeedback(`Yummy ${word}! 😋`);
    setTimeout(() => setBorisEmoji("🐶"), 500);
    if (newFed >= total) {
      setTimeout(() => setComplete(true), 800);
    }
  };

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🐶</div>
        <h2 className="game-complete-title">Boris is Full!</h2>
        <p className="game-complete-score">Boris ate everything! 🐶⭐</p>
        <div className="game-stars">⭐⭐⭐</div>
        <button className="game-replay-btn" onClick={initGame}>
          🔄 Play Again!
        </button>
      </div>
    );
  }

  return (
    <div className="game-area">
      <div className="game-score">
        ⭐ Fed: <strong>{fed}</strong> / <span>{total}</span>
      </div>
      <div className="game-progress">
        <div
          className="game-progress-bar"
          style={{ width: `${(fed / total) * 100}%` }}
        />
      </div>
      <div className="game-feedback">{feedback}</div>
      <div className="feed-game-area">
        <div className="feed-scene">
          <div
            className={`feed-cat ${dragOver ? "drag-over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
              setBorisEmoji("😸");
            }}
            onDragLeave={() => {
              setDragOver(false);
              setBorisEmoji("🐶");
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const word = e.dataTransfer.getData("text/word");
              if (word) eatItem(word);
            }}
          >
            {borisEmoji}
          </div>
          <div className="feed-items-container">
            {items.map((v) => (
              <div
                key={v.word}
                className="feed-item"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/word", v.word);
                }}
                onClick={() => eatItem(v.word)}
              >
                {v.emoji}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================
// Tab: Tell Me...
// ================================================
function TellMeTab({ scenario }: { scenario: ScenarioData }) {
  const [questions] = useState(() => {
    const prompts = [
      (v: VocabItem) => ({
        emoji: v.emoji,
        en: `Tell me: What do you like most about ${v.word} (${v.pt})?`,
        pt: `Me conte: O que você mais gosta sobre ${v.word} (${v.pt})?`,
      }),
      (v: VocabItem) => ({
        emoji: v.emoji,
        en: `Tell me: How often do you see or use ${v.word} in your daily life?`,
        pt: `Me conte: Com que frequência você vê ou usa ${v.word} no seu dia a dia?`,
      }),
      (v: VocabItem) => ({
        emoji: v.emoji,
        en: `Tell me: Can you describe ${v.word} using three different words in English?`,
        pt: `Me conte: Você consegue descrever ${v.word} usando três palavras em inglês?`,
      }),
      (v: VocabItem) => ({
        emoji: v.emoji,
        en: `Tell me: If you had to explain ${v.word} to a friend, what would you say?`,
        pt: `Me conte: Se você tivesse que explicar ${v.word} para um amigo, o que diria?`,
      }),
    ];
    return scenario.vocabulary.map((v, i) => {
      const fn = prompts[i % prompts.length];
      return fn(v);
    }).sort(() => Math.random() - 0.5);
  });
  const [qIndex, setQIndex] = useState(0);
  const [showPt, setShowPt] = useState(false);
  const [complete, setComplete] = useState(false);

  const nextQuestion = () => {
    setShowPt(false);
    if (qIndex + 1 < questions.length) {
      setQIndex((q) => q + 1);
    } else {
      setComplete(true);
    }
  };

  const restart = () => {
    setQIndex(0);
    setShowPt(false);
    setComplete(false);
  };

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🗣️</div>
        <h2 className="game-complete-title">Awesome Speaking Time!</h2>
        <p className="game-complete-score">
          You answered all the personal questions out loud! Boris is super proud! 🐶⭐
        </p>
        <div className="game-stars">⭐⭐⭐</div>
        <button className="game-replay-btn" onClick={restart}>
          🔄 Play Again!
        </button>
      </div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="game-area" style={{ textAlign: "center" }}>
      <div className="game-score">
        ⭐ Question: <strong>{qIndex + 1}</strong> / <span>{questions.length}</span>
      </div>
      <div className="game-progress">
        <div
          className="game-progress-bar"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.08)",
          margin: "1.5rem 0",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{q.emoji}</div>
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--accent-secondary)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "0.5rem",
          }}
        >
          💬 Tell Me...
        </div>
        <div
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "1.5rem",
          }}
        >
          {q.en}
        </div>

        {!showPt ? (
          <button
            className="back-btn"
            style={{ margin: "0 auto 1.5rem", cursor: "pointer" }}
            onClick={() => setShowPt(true)}
          >
            🇧🇷 Show Translation
          </button>
        ) : (
          <div
            style={{
              padding: "1rem",
              background: "var(--bg-tertiary)",
              borderRadius: "var(--radius-lg)",
              color: "var(--accent-primary)",
              fontSize: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            {q.pt}
          </div>
        )}

        <div>
          <button className="game-replay-btn" onClick={nextQuestion}>
            Next Question →
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================
// Tab: Find the Mistake
// ================================================
function FindMistakeTab({ scenario }: { scenario: ScenarioData }) {
  const [questions, setQuestions] = useState<
    { emoji: string; wrongEn: string; correctEn: string; pt: string }[]
  >([]);
  const [qIndex, setQIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [complete, setComplete] = useState(false);

  const initGame = useCallback(() => {
    const pool: { emoji: string; wrongEn: string; correctEn: string; pt: string }[] = [];

    // 1. Curated questions if available
    if (scenario.findMistakeQuestions && scenario.findMistakeQuestions.length > 0) {
      pool.push(...scenario.findMistakeQuestions);
    }

    // 2. Dynamic mistake generators to ensure at least 15 items
    const vocab = [...scenario.vocabulary];
    vocab.forEach((v, i) => {
      const wrong = vocab[(i + 3) % vocab.length];
      const wrong2 = vocab[(i + 5) % vocab.length];

      pool.push({
        emoji: v.emoji,
        wrongEn: `I can use a "${v.word}" as a "${wrong.word}".`,
        correctEn: `No! A "${v.word}" (${v.pt}) cannot be used as a "${wrong.word}" (${wrong.pt}).`,
        pt: `Mistura incorreta: ${v.word} não é ${wrong.word}!`,
      });

      pool.push({
        emoji: v.emoji,
        wrongEn: `In English, the word "${v.word}" means "${wrong2.pt}" in Portuguese.`,
        correctEn: `No! "${v.word}" actually translates to "${v.pt}", not "${wrong2.pt}".`,
        pt: `Tradução incorreta: "${v.word}" significa "${v.pt}"!`,
      });

      if (v.word.length >= 3) {
        const wrongLetter = String.fromCharCode(((v.word.charCodeAt(0) - 65 + 6) % 26) + 65);
        pool.push({
          emoji: v.emoji,
          wrongEn: `The English word "${v.word}" starts with the letter '${wrongLetter}'.`,
          correctEn: `No! "${v.word}" begins with '${v.word[0].toUpperCase()}', not '${wrongLetter}'.`,
          pt: `Letra inicial incorreta: "${v.word}" começa com '${v.word[0].toUpperCase()}'.`,
        });
      }
    });

    // Shuffle and pick 15 questions
    const targetCount = Math.min(15, pool.length);
    const selected = pool.sort(() => Math.random() - 0.5).slice(0, targetCount);
    setQuestions(selected);
    setQIndex(0);
    setShowAnswer(false);
    setComplete(false);
  }, [scenario]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const nextQuestion = () => {
    setShowAnswer(false);
    if (qIndex + 1 < questions.length) {
      setQIndex((q) => q + 1);
    } else {
      setComplete(true);
    }
  };

  const restart = () => {
    initGame();
  };

  if (questions.length === 0) return null;

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🔍</div>
        <h2 className="game-complete-title">Great Job Detective!</h2>
        <p className="game-complete-score">
          You spotted all {questions.length} vocabulary mistakes! Boris is so proud! 🐶⭐
        </p>
        <div className="game-stars">⭐⭐⭐</div>
        <button className="game-replay-btn" onClick={restart}>
          🔄 Play Again!
        </button>
      </div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="game-area" style={{ textAlign: "center" }}>
      <div className="game-score">
        ⭐ Progress: <strong>{qIndex + 1}</strong> / <span>{questions.length}</span>
      </div>
      <div className="game-progress">
        <div
          className="game-progress-bar"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          border: "1px solid rgba(255,255,255,0.08)",
          margin: "1.5rem 0",
        }}
      >
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{q.emoji}</div>
        <div
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--accent-red)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "0.5rem",
          }}
        >
          ⚠️ Find the mistake in this sentence:
        </div>
        <div
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "var(--accent-red)",
            marginBottom: "1.5rem",
            padding: "1rem",
            background: "rgba(239, 83, 80, 0.1)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(239, 83, 80, 0.3)",
          }}
        >
          &quot;{q.wrongEn}&quot;
        </div>

        {!showAnswer ? (
          <button
            className="back-btn"
            style={{ margin: "0 auto 1.5rem", cursor: "pointer" }}
            onClick={() => setShowAnswer(true)}
          >
            💡 Show Correct Answer &amp; Explanation
          </button>
        ) : (
          <div
            style={{
              padding: "1.2rem",
              background: "rgba(102, 187, 106, 0.15)",
              borderRadius: "var(--radius-lg)",
              color: "var(--accent-green)",
              fontSize: "1rem",
              border: "1px solid rgba(102, 187, 106, 0.3)",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>
              ✅ Correct Explanation:
            </div>
            <div>{q.correctEn}</div>
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginTop: "0.5rem",
              }}
            >
              🇧🇷 {q.pt}
            </div>
          </div>
        )}

        <div>
          <button className="game-replay-btn" onClick={nextQuestion}>
            Next Sentence →
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================
// Tab: Sentence Builder
// ================================================
function SentenceBuilderTab({ scenario }: { scenario: ScenarioData }) {
  const [sentences] = useState(() =>
    [...scenario.gameSentences].sort(() => Math.random() - 0.5).slice(0, 8)
  );
  const [sIndex, setSIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "correct" | "wrong">("idle");

  useEffect(() => {
    if (sentences.length > 0) {
      setAvailable(
        sentences[0].en.split(" ").sort(() => Math.random() - 0.5)
      );
      setPlaced([]);
      setFeedback("idle");
    }
  }, [sentences]);

  const handleWordClick = (word: string, idx: number) => {
    if (feedback !== "idle") return;

    const newPlaced = [...placed, word];
    setPlaced(newPlaced);
    const newAvailable = [...available];
    newAvailable.splice(idx, 1);
    setAvailable(newAvailable);

    if (newAvailable.length === 0) {
      const correctSentence = sentences[sIndex].en;
      const builtSentence = newPlaced.join(" ");
      if (builtSentence === correctSentence) {
        setScore((s) => s + 1);
        setFeedback("correct");
      } else {
        setFeedback("wrong");
      }
      
      setTimeout(() => {
        setFeedback("idle");
        if (sIndex + 1 < sentences.length) {
          setSIndex((s) => s + 1);
          setPlaced([]);
          setAvailable(
            sentences[sIndex + 1].en
              .split(" ")
              .sort(() => Math.random() - 0.5)
          );
        } else {
          setComplete(true);
        }
      }, 2500); // 2.5s delay to read the feedback
    }
  };

  const removePlaced = (idx: number) => {
    if (feedback !== "idle") return;
    const word = placed[idx];
    const newPlaced = [...placed];
    newPlaced.splice(idx, 1);
    setPlaced(newPlaced);
    setAvailable([...available, word]);
  };

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🧱</div>
        <h2 className="game-complete-title">Sentence Master!</h2>
        <p className="game-complete-score">
          You built {score} out of {sentences.length} sentences correctly!
        </p>
        <div className="game-stars">
          {score >= sentences.length * 0.9
            ? "⭐⭐⭐"
            : score >= sentences.length * 0.6
              ? "⭐⭐"
              : "⭐"}
        </div>
        <button
          className="game-replay-btn"
          onClick={() => {
            setSIndex(0);
            setScore(0);
            setComplete(false);
            setPlaced([]);
            setFeedback("idle");
            setAvailable(
              sentences[0].en
                .split(" ")
                .sort(() => Math.random() - 0.5)
            );
          }}
        >
          🔄 Play Again!
        </button>
      </div>
    );
  }

  return (
    <div className="game-area">
      <div className="game-score">
        ⭐ Sentence: <strong>{sIndex + 1}</strong> /{" "}
        <span>{sentences.length}</span>
      </div>
      <div className="game-progress">
        <div
          className="game-progress-bar"
          style={{
            width: `${(sIndex / sentences.length) * 100}%`,
          }}
        />
      </div>
      <div className="game-prompt">
        <div className="game-prompt-label">🇧🇷 {sentences[sIndex].pt}</div>
        <div
          style={{
            minHeight: "60px",
            padding: "1rem",
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            justifyContent: "center",
            margin: "1rem 0",
            border: feedback === "correct" 
              ? "2px solid var(--accent-green)" 
              : feedback === "wrong" 
              ? "2px solid var(--accent-red)" 
              : "2px dashed rgba(255,255,255,0.15)",
          }}
        >
          {placed.length === 0 && (
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Click words below to build the sentence...
            </span>
          )}
          {placed.map((w, i) => (
            <button
              key={`${w}-${i}`}
              onClick={() => removePlaced(i)}
              style={{
                padding: "0.4rem 0.8rem",
                background: feedback === "correct" 
                  ? "var(--accent-green)" 
                  : feedback === "wrong" 
                  ? "var(--accent-red)" 
                  : "var(--accent-primary)",
                color: feedback !== "idle" ? "#fff" : "var(--bg-primary)",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600,
                fontSize: "0.9rem",
                border: "none",
                cursor: feedback === "idle" ? "pointer" : "default",
              }}
            >
              {w}
            </button>
          ))}
        </div>
        
        {feedback === "correct" && (
          <div style={{ color: "var(--accent-green)", fontWeight: "bold", marginBottom: "1rem" }}>
            ✅ Correct! Great job!
          </div>
        )}
        {feedback === "wrong" && (
          <div style={{ color: "var(--accent-red)", fontWeight: "bold", marginBottom: "1rem", background: "rgba(239, 83, 80, 0.1)", padding: "0.5rem", borderRadius: "8px" }}>
            ❌ Oops! The correct sentence is:<br/>
            <span style={{ color: "var(--text-primary)" }}>{sentences[sIndex].en}</span>
          </div>
        )}
      </div>
      <div className="game-options" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", opacity: feedback !== "idle" ? 0.5 : 1, pointerEvents: feedback !== "idle" ? "none" : "auto" }}>
        {available.map((w, i) => (
          <button
            key={`${w}-${i}`}
            className="game-option"
            style={{ flex: "0 0 auto", width: "auto" }}
            onClick={() => handleWordClick(w, i)}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

// ================================================
// Tab: Spelling Scramble
// ================================================
function SpellingScrambleTab({ scenario }: { scenario: ScenarioData }) {
  const [words] = useState(() =>
    [...scenario.vocabulary]
      .sort(() => Math.random() - 0.5)
      .slice(0, 8)
  );
  const [wIndex, setWIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (words.length > 0) {
      setAvailable(
        words[0].word
          .toUpperCase()
          .split("")
          .sort(() => Math.random() - 0.5)
      );
      setPlaced([]);
    }
  }, [words]);

  const handleLetterClick = (letter: string, idx: number) => {
    const newPlaced = [...placed, letter];
    setPlaced(newPlaced);
    const newAvail = [...available];
    newAvail.splice(idx, 1);
    setAvailable(newAvail);

    if (newAvail.length === 0) {
      const correctWord = words[wIndex].word.toUpperCase();
      if (newPlaced.join("") === correctWord) {
        setScore((s) => s + 1);
      }
      setTimeout(() => {
        if (wIndex + 1 < words.length) {
          setWIndex((w) => w + 1);
          setPlaced([]);
          setAvailable(
            words[wIndex + 1].word
              .toUpperCase()
              .split("")
              .sort(() => Math.random() - 0.5)
          );
        } else {
          setComplete(true);
        }
      }, 1200);
    }
  };

  if (complete) {
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">✏️</div>
        <h2 className="game-complete-title">Spelling Champ!</h2>
        <p className="game-complete-score">
          You spelled {score} out of {words.length} words correctly!
        </p>
        <div className="game-stars">
          {score >= words.length * 0.9
            ? "⭐⭐⭐"
            : score >= words.length * 0.6
              ? "⭐⭐"
              : "⭐"}
        </div>
        <button
          className="game-replay-btn"
          onClick={() => {
            setWIndex(0);
            setScore(0);
            setComplete(false);
            setPlaced([]);
            setAvailable(
              words[0].word
                .toUpperCase()
                .split("")
                .sort(() => Math.random() - 0.5)
            );
          }}
        >
          🔄 Play Again!
        </button>
      </div>
    );
  }

  const w = words[wIndex];

  return (
    <div className="game-area">
      <div className="game-score">
        ⭐ Word: <strong>{wIndex + 1}</strong> / <span>{words.length}</span>
      </div>
      <div className="game-progress">
        <div
          className="game-progress-bar"
          style={{ width: `${(wIndex / words.length) * 100}%` }}
        />
      </div>
      <div className="game-prompt">
        <div className="game-prompt-label">Spell this word:</div>
        <div className="game-prompt-content">
          <span style={{ fontSize: "4rem" }}>{w.emoji}</span>
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          🇧🇷 {w.pt}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          justifyContent: "center",
          margin: "1rem 0",
          minHeight: "50px",
          flexWrap: "wrap",
        }}
      >
        {placed.map((l, i) => (
          <span
            key={i}
            style={{
              width: "36px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--accent-primary)",
              color: "var(--bg-primary)",
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              fontSize: "1.2rem",
            }}
          >
            {l}
          </span>
        ))}
        {available.map((_, i) => (
          <span
            key={`empty-${i}`}
            style={{
              width: "36px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-card)",
              border: "2px dashed rgba(255,255,255,0.15)",
              borderRadius: "var(--radius-sm)",
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "var(--text-muted)",
            }}
          >
            _
          </span>
        ))}
      </div>
      <div className="game-options" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
        {available.map((l, i) => (
          <button
            key={`${l}-${i}`}
            className="game-option"
            style={{ width: "50px", fontWeight: 700, fontSize: "1.1rem" }}
            onClick={() => handleLetterClick(l, i)}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

// ================================================
// Tab: True or False
// ================================================
function TrueOrFalseTab({ scenario }: { scenario: ScenarioData }) {
  const [questions, setQuestions] = useState<
    { statement: string; statementPt: string; correct: boolean; explanation?: string }[]
  >([]);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [complete, setComplete] = useState(false);
  const [showPt, setShowPt] = useState(false);

  const initGame = useCallback(() => {
    const qs: { statement: string; statementPt: string; correct: boolean; explanation?: string }[] = [];
    const vocab = [...scenario.vocabulary].sort(() => Math.random() - 0.5);

    // 1. Generate A2 Vocabulary & Sentence Structure Questions
    vocab.forEach((v, i) => {
      // Question 1: Translation/Meaning
      if (i % 2 === 0) {
        qs.push({
          statement: `In English, the word "${v.word}" corresponds to "${v.pt}" in Portuguese.`,
          statementPt: `Em inglês, a palavra "${v.word}" corresponde a "${v.pt}" em português.`,
          correct: true,
          explanation: `Correct! "${v.word}" means "${v.pt}".`,
        });
      } else {
        const wrongV = vocab[(i + 2) % vocab.length];
        qs.push({
          statement: `In English, the word "${v.word}" corresponds to "${wrongV.pt}" in Portuguese.`,
          statementPt: `Em inglês, a palavra "${v.word}" corresponde a "${wrongV.pt}" em português.`,
          correct: false,
          explanation: `False! "${v.word}" means "${v.pt}", while "${wrongV.word}" means "${wrongV.pt}".`,
        });
      }

      // Question 2: Spelling/Letter
      if (v.word.length >= 3) {
        if (i % 3 === 0) {
          qs.push({
            statement: `The English word "${v.word}" begins with the letter '${v.word[0].toUpperCase()}'.`,
            statementPt: `A palavra em inglês "${v.word}" começa com a letra '${v.word[0].toUpperCase()}'.`,
            correct: true,
            explanation: `Correct! "${v.word}" begins with '${v.word[0].toUpperCase()}'.`,
          });
        } else if (i % 3 === 1) {
          const wrongLetter = String.fromCharCode(((v.word.charCodeAt(0) - 65 + 7) % 26) + 65);
          qs.push({
            statement: `The English word "${v.word}" begins with the letter '${wrongLetter}'.`,
            statementPt: `A palavra em inglês "${v.word}" começa com a letra '${wrongLetter}'.`,
            correct: false,
            explanation: `False! "${v.word}" begins with '${v.word[0].toUpperCase()}', not '${wrongLetter}'.`,
          });
        }
      }
    });

    // 2. Add scenario-specific A2 context questions if available
    if (scenario.findMistakeQuestions && scenario.findMistakeQuestions.length > 0) {
      scenario.findMistakeQuestions.forEach((fm, idx) => {
        if (idx % 2 === 0) {
          qs.push({
            statement: fm.wrongEn,
            statementPt: fm.pt,
            correct: false,
            explanation: fm.correctEn,
          });
        } else {
          qs.push({
            statement: fm.correctEn.replace(/^No!\s*/i, ""),
            statementPt: fm.pt,
            correct: true,
            explanation: "That is correct!",
          });
        }
      });
    }

    // Shuffle and select 15 A2 questions
    const targetCount = Math.min(15, qs.length);
    const shuffled = qs.sort(() => Math.random() - 0.5).slice(0, targetCount);
    setQuestions(shuffled);
    setQIndex(0);
    setScore(0);
    setAnswered(false);
    setFeedback("");
    setComplete(false);
    setShowPt(false);
  }, [scenario]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleAnswer = (answer: boolean) => {
    if (answered || questions.length === 0) return;
    setAnswered(true);
    const currentQ = questions[qIndex];
    const isCorrect = currentQ.correct === answer;
    if (isCorrect) {
      setScore((s) => s + 1);
      setFeedback(`🎉 Correct! ${currentQ.explanation || ""}`);
    } else {
      setFeedback(
        `❌ Incorrect! ${currentQ.explanation || (currentQ.correct ? "This statement is TRUE." : "This statement is FALSE.")}`
      );
    }
    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex((q) => q + 1);
        setAnswered(false);
        setFeedback("");
        setShowPt(false);
      } else {
        setComplete(true);
      }
    }, 2000);
  };

  if (questions.length === 0) return null;

  if (complete) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="game-complete active">
        <div className="game-complete-emoji">🎯</div>
        <h2 className="game-complete-title">A2 Level Challenge Complete!</h2>
        <p className="game-complete-score">
          You scored {score} out of {questions.length} ({pct}%)
        </p>
        <div className="game-stars">
          {pct >= 90 ? "⭐⭐⭐" : pct >= 60 ? "⭐⭐" : "⭐"}
        </div>
        <button className="game-replay-btn" onClick={initGame}>
          🔄 Play Again!
        </button>
      </div>
    );
  }

  const q = questions[qIndex];

  return (
    <div className="game-area tf-game-area" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        <span className="level-badge-a2">Level A2 Grammar & Comprehension</span>
        <div className="game-score">
          Score: <strong>{score}</strong> / <span>{questions.length}</span>
        </div>
      </div>

      <div className="game-progress" style={{ marginBottom: "1.5rem" }}>
        <div
          className="game-progress-bar"
          style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="tf-statement-card">
        <div className="tf-statement-tag">Statement {qIndex + 1} of {questions.length}</div>
        <p className="tf-statement-text">&ldquo;{q.statement}&rdquo;</p>
        
        {showPt ? (
          <p className="tf-statement-pt" onClick={() => setShowPt(false)} style={{ cursor: "pointer" }}>
            🇧🇷 {q.statementPt} <span style={{ opacity: 0.6, fontSize: "0.8rem" }}>(click to hide)</span>
          </p>
        ) : (
          <button className="tf-translation-btn" onClick={() => setShowPt(true)}>
            💡 Reveal Translation
          </button>
        )}
      </div>

      <div className="game-options" style={{ maxWidth: "440px", margin: "1.5rem auto 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <button
          className={`game-option tf-btn tf-btn-true ${answered ? (q.correct ? "correct" : "wrong") + " disabled" : ""}`}
          onClick={() => handleAnswer(true)}
          disabled={answered}
        >
          TRUE
        </button>
        <button
          className={`game-option tf-btn tf-btn-false ${answered ? (!q.correct ? "correct" : "wrong") + " disabled" : ""}`}
          onClick={() => handleAnswer(false)}
          disabled={answered}
        >
          FALSE
        </button>
      </div>

      {feedback && (
        <div className={`game-feedback ${feedback.includes("Correct") ? "correct-msg" : "wrong-msg"}`} style={{ marginTop: "1rem" }}>
          {feedback}
        </div>
      )}
    </div>
  );
}

// ================================================
// MAIN SCENARIO PAGE
// ================================================
type TabId =
  | "story"
  | "vocab"
  | "game"
  | "memory"
  | "feed"
  | "tellme"
  | "findmistake"
  | "truefalse"
  | "sentence"
  | "scramble";

const TABS: { id: TabId; label: string }[] = [
  { id: "story", label: "💬 Story Time" },
  { id: "vocab", label: "📖 Word Garden" },
  { id: "game", label: "🎮 Play & Learn" },
  { id: "memory", label: "🃏 Matching Pairs" },
  { id: "feed", label: "🐶 Feed Boris" },
  { id: "tellme", label: "💬 Tell Me..." },
  { id: "findmistake", label: "🔍 Find the Mistake" },
  { id: "truefalse", label: "🤔 True or False" },
  { id: "sentence", label: "🧱 Build a Sentence" },
  { id: "scramble", label: "✏️ Spelling Scramble" },
];

export default function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const scenario = getScenarioBySlug(slug);
  const [activeTab, setActiveTab] = useState<TabId>("story");

  if (!scenario) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <header className="header scrolled" id="app-header">
        <div className="header-inner">
          <Link href="/" className="logo">
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
          <div className="lang-badge">EN / PT</div>
        </div>
      </header>

      {/* Scenario Hero */}
      <section className="scenario-hero">
        <Image
          src={`/images/scenarios/${scenario.slug}.png`}
          alt={scenario.titleEn}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="scenario-hero-overlay">
          <div className="scenario-hero-icon">{scenario.icon}</div>
          <h1 className="scenario-hero-title">
            Boris&apos;s {scenario.titleEn}
          </h1>
          <p className="scenario-hero-subtitle">{scenario.heroSubtitle}</p>
        </div>
      </section>

      {/* Scenario Content */}
      <div className="scenario-container">
        <Link href="/" className="back-btn">
          ← Back to Home
        </Link>

        {/* Tabs */}
        <div className="scenario-tabs" id="scenario-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`scenario-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className={`tab-panel ${activeTab === "story" ? "active" : ""}`}>
          <StoryTab scenario={scenario} />
        </div>

        <div className={`tab-panel ${activeTab === "vocab" ? "active" : ""}`}>
          <VocabTab scenario={scenario} />
        </div>

        <div className={`tab-panel ${activeTab === "game" ? "active" : ""}`}>
          <QuizTab scenario={scenario} />
        </div>

        <div className={`tab-panel ${activeTab === "memory" ? "active" : ""}`}>
          <MemoryTab scenario={scenario} />
        </div>

        <div className={`tab-panel ${activeTab === "feed" ? "active" : ""}`}>
          <FeedBorisTab scenario={scenario} />
        </div>

        <div className={`tab-panel ${activeTab === "tellme" ? "active" : ""}`}>
          <TellMeTab scenario={scenario} />
        </div>

        <div className={`tab-panel ${activeTab === "findmistake" ? "active" : ""}`}>
          <FindMistakeTab scenario={scenario} />
        </div>

        <div
          className={`tab-panel ${activeTab === "truefalse" ? "active" : ""}`}
        >
          <TrueOrFalseTab scenario={scenario} />
        </div>

        <div
          className={`tab-panel ${activeTab === "sentence" ? "active" : ""}`}
        >
          <SentenceBuilderTab scenario={scenario} />
        </div>

        <div
          className={`tab-panel ${activeTab === "scramble" ? "active" : ""}`}
        >
          <SpellingScrambleTab scenario={scenario} />
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-encouragement">
            <span>✨</span>
            {scenario.footerMsg}
          </p>
          <p className="footer-encouragement-pt">
            Você está indo muito bem! Continue praticando!
          </p>
          <p className="footer-credits">
            Made with ♥ by Learn with Boris · Inglês com o Boris
          </p>
        </div>
      </footer>
    </>
  );
}
