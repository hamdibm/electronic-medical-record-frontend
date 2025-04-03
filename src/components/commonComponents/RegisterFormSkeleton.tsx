interface RegisterFormSkeletonProps {
    children: ReactNode;
}

import { ReactNode } from "react";

interface RegisterFormSkeletonProps {
  formTitle :string;
  children: ReactNode;
}

const RegisterFormSkeleton: React.FC<RegisterFormSkeletonProps> = ({ children ,formTitle}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
        {formTitle}
      </h2>
      {children}
    </div>
  );
};

export default RegisterFormSkeleton;