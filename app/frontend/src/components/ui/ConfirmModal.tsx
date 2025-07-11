import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel"
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-white">{title}</h2>
        <p className="mb-6 text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
} 