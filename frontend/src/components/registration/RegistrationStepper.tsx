interface RegistrationStepperProps {
  steps: string[];
  currentStep: number;
}

export default function RegistrationStepper({ steps, currentStep }: RegistrationStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={step} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isCompleted || isCurrent
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#F8FAFC] text-[#94A3B8] ring-1 ring-inset ring-[#E2E8F0]"
                }`}
              >
                {isCompleted ? "\u2713" : stepNumber}
              </span>
              <span
                className={`whitespace-nowrap text-xs font-medium ${
                  isCurrent ? "text-[#2563EB]" : "text-[#64748B]"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span className="h-px w-8 bg-[#E2E8F0] sm:w-16" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
