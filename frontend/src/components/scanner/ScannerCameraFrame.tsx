interface ScannerCameraFrameProps {
  active: boolean;
}

// This renders a placeholder viewfinder only. Wire up a real reader by:
//   npm install html5-qrcode
// and mounting <Html5QrcodeScanner> here, calling props.onDetected(text)
// from its success callback instead of the demo buttons on QRScannerPage.
export function ScannerCameraFrame({ active }: ScannerCameraFrameProps) {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-900">
      <div className="absolute inset-[16%]">
        <span className="absolute left-0 top-0 h-7 w-7 rounded-tl-md border-l-[3px] border-t-[3px] border-blue-400" />
        <span className="absolute right-0 top-0 h-7 w-7 rounded-tr-md border-r-[3px] border-t-[3px] border-blue-400" />
        <span className="absolute bottom-0 left-0 h-7 w-7 rounded-bl-md border-b-[3px] border-l-[3px] border-blue-400" />
        <span className="absolute bottom-0 right-0 h-7 w-7 rounded-br-md border-b-[3px] border-r-[3px] border-blue-400" />
        {active && (
          <span className="absolute left-0 right-0 top-1/2 h-0.5 animate-pulse bg-blue-400/80" />
        )}
      </div>
      <div className="absolute bottom-3 left-0 right-0 text-center text-xs text-gray-400">
        camera preview (simulated)
      </div>
    </div>
  );
}
