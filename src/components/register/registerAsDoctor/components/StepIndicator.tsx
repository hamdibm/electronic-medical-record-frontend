import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step circle */}
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium 
                ${isActive ? 'bg-blue-600 text-white' : 
                  isCompleted ? 'bg-blue-200 text-blue-600' : 'bg-gray-200 text-gray-500'}`}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                stepNumber
              )}
            </div>
            
            {/* Connector line */}
            {stepNumber < totalSteps && (
              <div className={`w-24 h-1 ${stepNumber < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};
export default StepIndicator;