
import { useState, FC } from 'react';
import { QUIZ_QUESTIONS } from '../constants';

interface QuizProps {
  onComplete: (results: any) => void;
}

const Quiz: FC<QuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    const newAnswers = [...answers, option];
    if (step < QUIZ_QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="bg-[#004d4d] text-white p-12 rounded-3xl shadow-2xl border border-teal-400/20 max-w-2xl mx-auto">
      <div className="mb-8">
        <span className="text-amber-400 text-xs tracking-widest uppercase mb-2 block">Step {step + 1} of 3</span>
        <h3 className="text-3xl font-serif">{QUIZ_QUESTIONS[step].question}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {QUIZ_QUESTIONS[step].options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className="w-full text-left px-6 py-4 rounded-xl border border-white/10 hover:border-amber-400 hover:bg-white/5 transition-all duration-300 group flex justify-between items-center"
          >
            <span className="text-lg font-light tracking-wide">{opt}</span>
            <i className="fa-solid fa-chevron-right text-white/20 group-hover:text-amber-400 transform group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
      <div className="mt-8 flex gap-1">
        {QUIZ_QUESTIONS.map((_, idx) => (
          <div key={idx} className={`h-1 flex-1 rounded-full ${idx <= step ? 'bg-amber-400' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
};

export default Quiz;
