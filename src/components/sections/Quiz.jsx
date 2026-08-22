import { useState } from "react";
import { SectionShell, SectionHeading, Card, Callout, Pill } from "../ui/Primitives";
import { Button } from "../ui/Button";
import { Eq } from "../ui/Math";
import { QUIZ_QUESTIONS } from "../../physics/quizData";

// Section 9 — Quiz assessment.
export const Quiz = ({ onProgress }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textValue, setTextValue] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const total = QUIZ_QUESTIONS.length;

  const submitMC = (i) => {
    if (feedback) return;
    const correct = i === q.answer;
    setAnswers((a) => ({ ...a, [q.id]: correct }));
    setFeedback({ correct, choice: i });
  };
  const submitText = () => {
    if (feedback || textValue.trim() === "") return;
    const val = parseFloat(textValue);
    const correct = Math.abs(val - parseFloat(q.answer)) <= (q.tolerance || 0.01);
    setAnswers((a) => ({ ...a, [q.id]: correct }));
    setFeedback({ correct, value: textValue });
  };

  const next = () => {
    if (current + 1 >= total) {
      setFinished(true);
      const score = Object.values(answers).filter(Boolean).length;
      onProgress?.("quiz", score >= Math.ceil(total * 0.6));
    } else {
      setCurrent((c) => c + 1);
      setFeedback(null);
      setTextValue("");
    }
  };
  const restart = () => {
    setCurrent(0);
    setAnswers({});
    setFeedback(null);
    setTextValue("");
    setFinished(false);
  };

  if (finished) {
    const score = Object.values(answers).filter(Boolean).length;
    const pct = Math.round((score / total) * 100);
    return (
      <SectionShell id="quiz">
        <SectionHeading id="quiz" eyebrow="Practice" title="Quiz complete" />
        <Card className="mx-auto max-w-lg text-center">
          <p className="text-sm text-slate-500">Your score</p>
          <p className="my-2 text-5xl font-bold text-blue-600">{score}/{total}</p>
          <p className="text-lg font-semibold text-slate-700">{pct}%</p>
          <div className="my-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-slate-600">
            {pct >= 80 ? "Excellent — you've mastered the key ideas." : pct >= 60 ? "Good work. Review the explanations and try again." : "Keep practising — revisit the sections above."}
          </p>
          <div className="mt-4">
            <Button onClick={restart} variant="secondary">Retake quiz</Button>
          </div>
        </Card>
      </SectionShell>
    );
  }

  return (
    <SectionShell id="quiz">
      <SectionHeading
        id="quiz"
        eyebrow="Practice"
        title="Check your understanding"
      >
        Ten questions mixing concepts, numerical work, graph interpretation and
        projectile motion. Feedback after each one.
      </SectionHeading>

      <Card className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <Pill color="slate">Question {current + 1} of {total}</Pill>
          <div className="flex gap-1">
            {QUIZ_QUESTIONS.map((qq, i) => (
              <span
                key={qq.id}
                className={`h-1.5 w-5 rounded-full ${i === current ? "bg-blue-600" : answers[qq.id] !== undefined ? (answers[qq.id] ? "bg-emerald-500" : "bg-rose-400") : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>

        {/* progress bar */}
        <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${((current + (feedback ? 1 : 0)) / total) * 100}%` }} />
        </div>

        <div className="mb-3">
          <Pill color="blue">{q.type}</Pill>
        </div>
        <p className="mb-4 text-base font-medium text-slate-800">{q.prompt}</p>

        {q.type === "numerical" ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="number"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              disabled={!!feedback}
              placeholder="Your answer"
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100"
              onKeyDown={(e) => e.key === "Enter" && submitText()}
            />
            <span className="text-sm text-slate-500">{q.unit}</span>
            <Button size="sm" onClick={submitText} disabled={!!feedback || textValue.trim() === ""}>Check</Button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              let style = "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40";
              if (feedback) {
                if (i === q.answer) style = "border-emerald-400 bg-emerald-50 text-emerald-800";
                else if (i === feedback.choice) style = "border-rose-400 bg-rose-50 text-rose-800";
                else style = "border-slate-200 bg-white opacity-60";
              }
              return (
                <button
                  key={i}
                  onClick={() => submitMC(i)}
                  disabled={!!feedback}
                  className={`rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {feedback && (
          <div className="kin-fade-in mt-4">
            <Callout variant={feedback.correct ? "success" : "danger"} title={feedback.correct ? "Correct!" : "Not quite"}>
              <p className="text-sm">{q.explanation}</p>
              {q.formula && (
                <div className="mt-2">
                  <Math>{q.formula}</Math>
                </div>
              )}
            </Callout>
            <div className="mt-3 flex justify-end">
              <Button size="sm" onClick={next}>
                {current + 1 >= total ? "See results →" : "Next question →"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </SectionShell>
  );
};
