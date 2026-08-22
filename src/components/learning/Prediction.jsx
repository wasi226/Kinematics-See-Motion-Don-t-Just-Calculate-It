import { useState } from "react";
import { Button } from "../ui/Button";
import { Math } from "../ui/Math";
import { Callout } from "../ui/Primitives";

// Prediction interaction: ask a question, hide the answer, reveal after submit.
// Props: question, options (array), correctIndex, explanation, onResolved?
// Used across multiple sections to implement Predict → Observe → Explain.
export const Prediction = ({
  question,
  options,
  correctIndex,
  explanation,
  formula,
  onResolved,
}) => {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
  };
  const submit = () => {
    if (selected === null) return;
    setRevealed(true);
    onResolved?.(selected === correctIndex);
  };
  const reset = () => {
    setSelected(null);
    setRevealed(false);
  };

  const isCorrect = revealed && selected === correctIndex;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
        Predict
      </p>
      <p className="mb-4 text-base font-medium text-slate-800">{question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt, i) => {
          let style =
            "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40";
          if (revealed) {
            if (i === correctIndex)
              style = "border-emerald-400 bg-emerald-50 text-emerald-800";
            else if (i === selected)
              style = "border-rose-400 bg-rose-50 text-rose-800";
            else style = "border-slate-200 bg-white opacity-60";
          } else if (i === selected) {
            style = "border-blue-500 bg-blue-50 ring-2 ring-blue-200";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={revealed}
              className={`rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-all ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        {!revealed ? (
          <Button onClick={submit} disabled={selected === null} size="sm">
            Check answer
          </Button>
        ) : (
          <Button onClick={reset} variant="secondary" size="sm">
            Try again
          </Button>
        )}
        {revealed && (
          <span
            className={`text-sm font-semibold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </span>
        )}
      </div>
      {revealed && (
        <div className="kin-fade-in mt-4">
          <Callout variant={isCorrect ? "success" : "info"} title="Why?">
            <p>{explanation}</p>
            {formula && (
              <div className="mt-2">
                <Math>{formula}</Math>
              </div>
            )}
          </Callout>
        </div>
      )}
    </div>
  );
};
