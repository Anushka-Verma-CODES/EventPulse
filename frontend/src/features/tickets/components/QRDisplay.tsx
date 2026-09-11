import QRCode from 'react-qr-code';

interface QRDisplayProps {
  value: string;
  size?: number;
}

export function QRDisplay({ value, size = 168 }: QRDisplayProps) {
  return (
    <div style={{
      background: 'white',
      padding: '16px',
      borderRadius: '16px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 0 32px rgba(124,58,237,0.3), 0 0 64px rgba(79,70,229,0.15)',
      border: '1px solid rgba(124,58,237,0.15)',
    }}>
      <QRCode value={value} size={size} level="M" />
    </div>
  );
}