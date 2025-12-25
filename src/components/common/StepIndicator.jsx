function StepIndicator({ step }) {
  const steps = [
    "Compte",
    "Informations",
    "Documents"
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex w-full max-w-md justify-between">
        {steps.map((label, index) => {
          const active = index + 1 === step;
          const completed = index + 1 < step;

          return (
            <div key={index} className="flex flex-col items-center w-full">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border 
                  ${active ? "bg-sky-500 text-black border-sky-400" :
                  completed ? "bg-emerald-500 border-emerald-400 text-black" :
                  "bg-slate-800 border-slate-600 text-slate-400"}
                `}
              >
                {index + 1}
              </div>
              <p className="text-xs mt-2 text-slate-300">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
