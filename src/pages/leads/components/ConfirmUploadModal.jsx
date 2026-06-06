import React from "react";
import Modal from "@/components/ui/Modal";
import AccentButton from "@/components/ui/AccentButton";
import GrayButton from "@/components/ui/GrayButton";

function ConfirmUploadModal({
  isOpen,
  file,
  rowCount = 0,
  fallbackSource = "",
  fallbackCampaign = "",
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Confirm Lead Import" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-800">
          Import <span className="font-semibold">{rowCount}</span> lead{rowCount === 1 ? "" : "s"} from{" "}
          <span className="font-semibold">{file?.name || "this CSV file"}</span>?
        </p>

        <div className="space-y-2 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
          <p className="text-gray-700">
            <span className="font-medium">Fallback Source:</span> {fallbackSource || "Not selected"}
          </p>

          <p className="text-gray-700">
            <span className="font-medium">Fallback Campaign:</span> {fallbackCampaign || "Not selected"}
          </p>
        </div>

        <p className="text-xs text-gray-500">Invalid rows and duplicates may be skipped during import.</p>

        <div className="mt-4 flex justify-end gap-3">
          <div className="w-fit">
            <GrayButton text="Cancel" onClick={onCancel} disabled={loading} />
          </div>

          <div className="w-fit">
            <AccentButton text={loading ? "Importing..." : "Yes, Import"} onClick={onConfirm} loading={loading} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmUploadModal;
