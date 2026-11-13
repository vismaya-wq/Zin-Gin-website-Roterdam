import { useState } from 'react';
import '../styles/footer-quiz.css';

const QUESTIONS = [
  {
    q: 'Which one is traditionally made with fermented rice and lentil batter?',
    options: ['Dosa', 'Samosa', 'Naan'],
    answer: 0,
    reveal: 'Dosa — crisp, tangy and perfect for dipping.',
  },
  {
    q: 'At Zin & Gin, the bar side of the name stands for…',
    options: ['Gin & cocktails', 'Ginger tea only', 'Generic drinks'],
    answer: 0,
    reveal: 'Gin — botanical drinks alongside vegetarian Indian plates.',
  },
  {
    q: 'Which street snack is served with spiced mint water?',
    options: ['Pani puri', 'Naan', 'Biryani'],
    answer: 0,
    reveal: 'Pani puri — crack, sip, repeat.',
  },
  {
    q: 'Our kitchen is…',
    options: ['100% vegetarian', 'Seafood-focused', 'Mixed grill'],
    answer: 0,
    reveal: 'Always vegetarian — that is the Zin promise.',
  },
] as const;

function SuccessMark() {
  return (
    <svg className="fquiz__success-art" width="48" height="48" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="32" fill="rgba(61,143,90,0.15)" stroke="rgba(61,143,90,0.35)" strokeWidth="2" />
      <path d="M22 38l10 10 18-22" fill="none" stroke="#3d8f5a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FooterQuiz() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <section className="fquiz fquiz--done" aria-labelledby="fquiz-title">
        <SuccessMark />
        <h2 id="fquiz-title" className="h3">Congratulations!</h2>
        <p className="fquiz__reveal">You know your Indian food — come taste it at the table.</p>
      </section>
    );
  }

  const question = QUESTIONS[step];
  const isLast = step >= QUESTIONS.length - 1;
  const correct = picked !== null && picked === question.answer;

  return (
    <section className="fquiz" aria-labelledby="fquiz-title">
      <p className="eyebrow">Quick bite quiz</p>
      <h2 id="fquiz-title" className="h3">
        Question {step + 1}
        <span className="fquiz__step">/{QUESTIONS.length}</span>
      </h2>
      <p className="fquiz__q">{question.q}</p>
      <div className="fquiz__opts">
        {question.options.map((opt, index) => (
          <button
            key={opt}
            type="button"
            className={picked === index ? (index === question.answer ? 'is-right' : 'is-wrong') : ''}
            disabled={picked !== null}
            onClick={() => setPicked(index)}
          >
            {opt}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="fquiz__reveal" role="status">
          {correct ? (
            <div className="fquiz__win">
              <SuccessMark />
              <div>
                <strong>Congratulations!</strong>
                <span>{question.reveal}</span>
              </div>
            </div>
          ) : (
            <p>Nice try — {question.reveal}</p>
          )}
          {!isLast ? (
            <button
              type="button"
              className="fquiz__next"
              onClick={() => {
                setStep((s) => s + 1);
                setPicked(null);
              }}
            >
              Next question →
            </button>
          ) : (
            <button type="button" className="fquiz__next" onClick={() => setDone(true)}>
              Finish quiz →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
