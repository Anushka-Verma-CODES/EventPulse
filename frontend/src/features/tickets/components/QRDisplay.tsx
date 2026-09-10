import QRCode from 'react-qr-code';

interface QRDisplayProps {
  value: string;
  size?: number;
}

export function QRDisplay({ value, size = 160 }: QRDisplayProps) {
  return (
    <div className="bg-white p-4 flex justify-center rounded">
      <QRCode value={value} size={size} />
    </div>
  );
}