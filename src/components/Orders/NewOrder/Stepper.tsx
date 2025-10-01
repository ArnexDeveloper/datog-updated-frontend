import React from 'react';

interface Step {
  id: number;
  title: string;
  icon: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep = 0 }: StepperProps) {
  return (
    <div className="w-full flex flex-col items-center px-2 mb-8">
      <div className="relative flex items-center justify-between w-full max-w-[750px] mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-amber-300 -z-10" />
        <div
          className="absolute top-1/2 left-0 h-[2px] bg-amber-600 -z-10 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => (
          <div key={index} className="relative flex items-center justify-center">
            <div className="absolute w-6 h-4 bg-white"></div>
            <div
              className={`
                relative flex items-center justify-center rounded-full z-10 transition-all duration-300
                ${index === currentStep
                  ? "w-10 h-10 border-4 border-amber-600 bg-white shadow-lg"
                  : ""}
                ${index < currentStep ? "bg-amber-600 h-10 w-10 shadow-md" : index > currentStep ? "bg-amber-200 h-8 w-8" : ""}
              `}
            >
              {index < currentStep ? (
                <span className="text-white text-lg">✓</span>
              ) : (
                <div className={`${index === currentStep ? "text-amber-600" : index > currentStep ? "text-amber-400" : "text-white"}`}>
                  {step.icon}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between w-full max-w-[800px] mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex justify-center flex-1">
            <span
              className={`text-xs sm:text-sm md:text-base text-center font-medium transition-colors duration-300 ${
                index === currentStep ? "text-amber-800 font-bold" : index < currentStep ? "text-amber-700" : "text-amber-400"
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}