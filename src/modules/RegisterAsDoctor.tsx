import { useFormStore } from '../components/register/registerAsDoctor/store/formStore';
import StepIndicator from '../components/register/registerAsDoctor/components/StepIndicator';
import PersonalInfoStep from '../components/register/registerAsDoctor/components/steps/PersonalInfo';
import DocumentsUploadStep from '../components/register/registerAsDoctor/components/steps/DocumentUploadStep';
import ProfilePictureStep from '../components/register/registerAsDoctor/components/steps/ProfilePictureStep';


export default function RegisterAsDoctor() {

    const { currentStep } = useFormStore();
  
    const renderStep = () => {
      switch (currentStep) {
        case 1:
          return <PersonalInfoStep />;
        case 2:
          return <DocumentsUploadStep />;
        case 3:
          return <ProfilePictureStep />;
        default:
          return <PersonalInfoStep />;
      }
    };
    
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={3} />
          {renderStep()}
        </div>
      </div>
  );
}
