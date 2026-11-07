import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, CheckCircle2, VideoOff, Aperture, FlipHorizontal } from 'lucide-react';

interface WebcamCaptureProps {
  onPhotoCaptured: (photoData: { base64?: string; file?: File } | null) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onPhotoCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Start webcam
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setCameraError('Akses kamera tidak diizinkan atau perangkat tidak ditemukan.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.log('Autoplay error', e));
    }
  }, [isCameraActive, stream]);

  // Capture photo from video stream
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 120);

    // Draw frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Render official verification watermark
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID');
    const isoString = now.toISOString();

    const bannerHeight = 44;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`WFH PRESENCE AUDIT • ${dateStr} • ${timeStr} WIB`, 20, canvas.height - 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '400 12px "Courier New", monospace';
    ctx.fillText(isoString, canvas.width - 240, canvas.height - 18);

    const base64Image = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(base64Image);

    // Convert canvas to File blob for multipart transmission
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `wfh-snapshot-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onPhotoCaptured({ file, base64: base64Image });
      } else {
        onPhotoCaptured({ base64: base64Image });
      }
    }, 'image/jpeg', 0.85);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    onPhotoCaptured(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setCapturedPhoto(base64);
      onPhotoCaptured({ file, base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <canvas ref={canvasRef} className="hidden" />

      {/* Optical Viewfinder Frame */}
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm flex items-center justify-center select-none">
        {/* Shutter Flash Effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 pointer-events-none transition-opacity duration-100" />
        )}

        {capturedPhoto ? (
          <div className="relative w-full h-full">
            <img
              src={capturedPhoto}
              alt="Bukti Foto Presensi WFH"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-900/90 text-white text-[11px] font-mono px-2.5 py-1 rounded border border-slate-700/80 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>FRAME CAPTURED & WATERMARKED</span>
            </div>
          </div>
        ) : isCameraActive ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Precision Viewfinder Reticle */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              {/* Top Viewfinder Telemetry */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>OPTICAL SENSOR ACTIVE</span>
                </div>
                <div className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                  HD 720p
                </div>
              </div>

              {/* Viewfinder Center Crosshair */}
              <div className="self-center flex items-center justify-center w-24 h-24 border border-white/20 rounded-lg">
                <div className="w-2 h-0.5 bg-white/40" />
                <div className="h-2 w-0.5 bg-white/40" />
              </div>

              {/* Bottom Guidance */}
              <div className="text-center">
                <span className="text-[11px] font-mono text-slate-300/80 bg-slate-900/70 px-3 py-1 rounded border border-slate-800/80">
                  Posisikan wajah Anda tegak lurus ke arah kamera
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
            <VideoOff className="w-10 h-10 text-slate-600 mb-3" />
            <div className="text-sm font-semibold text-slate-200">Kamera Tidak Aktif</div>
            <p className="text-xs text-slate-400 max-w-xs mt-1 mb-4">
              {cameraError || 'Pastikan izin akses webcam diberikan di browser Anda.'}
            </p>
            <button
              type="button"
              onClick={startCamera}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Hubungkan Ulang Kamera
            </button>
          </div>
        )}
      </div>

      {/* Tactile Control Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full">
        {capturedPhoto ? (
          <button
            type="button"
            onClick={retakePhoto}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Ambil Ulang Foto
          </button>
        ) : isCameraActive ? (
          <button
            type="button"
            onClick={takeSnapshot}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-lg shadow-sm transition-all"
          >
            <Aperture className="w-4 h-4 text-emerald-400" />
            Ambil Foto Sekarang (Capture)
          </button>
        ) : null}

        {/* Secondary Upload Option */}
        <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-lg cursor-pointer transition-colors active:scale-98">
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span>Upload Berkas Foto</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>
    </div>
  );
};
