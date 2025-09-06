// Helper component to display form field errors
interface FormErrorProps {
  error?: {
    message?: string;
  } | string | null;
}

export const FormFieldError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  const message = typeof error === 'string' ? error : error.message;
  return message ? <p className="text-red-500 text-xs">{message}</p> : null;
};
