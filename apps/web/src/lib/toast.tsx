import toast from 'react-hot-toast';

function ToastMessage({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <div className="font-semibold text-sm">{title}</div>
      {description && <div className="text-sm opacity-80 mt-0.5">{description}</div>}
    </div>
  );
}

export const showToast = {
  success: (title: string, description?: string) =>
    toast.success(<ToastMessage title={title} description={description} />),
  error: (title: string, description?: string) =>
    toast.error(<ToastMessage title={title} description={description} />),
  info: (title: string, description?: string) =>
    toast(<ToastMessage title={title} description={description} />),
  loading: (message: string) => toast.loading(message),
  dismiss: (id: string) => toast.dismiss(id),
};
