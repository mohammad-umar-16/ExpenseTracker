import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { expParseImage } from '../api/api';
import toast from 'react-hot-toast';

function compressImage(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ReceiptUpload({ onParsed }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setBusy(true);
    try {
      const base64 = await compressImage(file);
      const parsed = await expParseImage(base64, 'image/jpeg');
      if (!parsed.amount) {
        toast('Could not read the amount — check the fields below', { icon: '🔍' });
      } else {
        toast.success('Receipt scanned');
      }
      onParsed(parsed);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Could not read receipt');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <button
        type="button"
        className="btn-ghost"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        style={{ padding: '9px 12px', display: 'flex', alignItems: 'center' }}
        title="Scan a receipt photo"
      >
        {busy ? <span className="spinner" /> : <Camera size={15} />}
      </button>
    </>
  );
}