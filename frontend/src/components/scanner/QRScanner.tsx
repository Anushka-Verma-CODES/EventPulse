import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Zap, ZapOff } from "lucide-react";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
}

const CONTAINER_ID = "eventpulse-qr-reader";

export default function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(true);

  useEffect(() => {
    const scanner = new Html5Qrcode(CONTAINER_ID);
    scannerRef.current = scanner;
    let isActive = true;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (isActive) onScanRef.current(decodedText);
        },
        () => {
          // Per-frame "no QR found" callback — expected constantly, ignore it.
        }
      )
      .catch((err) => {
        console.error("Unable to start the camera for scanning:", err);
      });

    return () => {
      isActive = false;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          // Scanner may already be stopped/unmounted — safe to ignore.
        });
    };
  }, []);

  async function toggleTorch() {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      await scanner.applyVideoConstraints({
        advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn((v) => !v);
    } catch {
      // Flash/torch isn't supported on this device/browser — hide the control.
      setTorchSupported(false);
    }
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-black">
        <div id={CONTAINER_ID} className="h-full w-full" />

        {/* Corner-bracket scan frame overlay, purely visual */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative h-56 w-56">
            <span className="absolute left-0 top-0 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-white/90" />
            <span className="absolute right-0 top-0 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-white/90" />
            <span className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-white/90" />
            <span className="absolute bottom-0 right-0 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-white/90" />
          </div>
        </div>
      </div>

      {torchSupported && (
        <button
          type="button"
          onClick={toggleTorch}
          className="mx-auto mt-3 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
        >
          {torchOn ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
          {torchOn ? "Turn Off Flash" : "Flash"}
        </button>
      )}
    </div>
  );
}
