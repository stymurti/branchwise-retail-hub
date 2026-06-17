import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, ScanBarcode, X } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

/**
 * Input yang siap menerima barcode dari HID scanner (autoFocus + Enter)
 * dan tombol "Scan via Kamera" sebagai alternatif.
 */
export function CartonScanner({ value, onChange, placeholder = "Scan / ketik barcode karton..." }: Props) {
  const [camOpen, setCamOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!camOpen) return;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    let active = true;
    (async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        const deviceId = devices[0]?.deviceId;
        if (!deviceId) {
          toast.error("Kamera tidak ditemukan");
          setCamOpen(false);
          return;
        }
        const controls = await reader.decodeFromVideoDevice(deviceId, videoRef.current!, (result) => {
          if (result && active) {
            onChange(result.getText());
            toast.success("Barcode terbaca: " + result.getText());
            controls.stop();
            setCamOpen(false);
          }
        });
        controlsRef.current = controls;
      } catch (e: any) {
        toast.error("Tidak bisa mengakses kamera: " + (e?.message ?? "unknown"));
        setCamOpen(false);
      }
    })();
    return () => {
      active = false;
      controlsRef.current?.stop();
    };
  }, [camOpen, onChange]);

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <ScanBarcode className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8 font-mono"
        />
      </div>
      <Button type="button" variant="outline" size="icon" onClick={() => setCamOpen(true)} title="Scan via kamera">
        <Camera className="w-4 h-4" />
      </Button>

      <Dialog open={camOpen} onOpenChange={setCamOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan Barcode via Kamera</DialogTitle>
          </DialogHeader>
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-primary/80" />
          </div>
          <Button variant="outline" onClick={() => setCamOpen(false)} className="gap-2">
            <X className="w-4 h-4" /> Tutup
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
