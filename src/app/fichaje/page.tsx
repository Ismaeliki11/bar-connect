"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle2, Clock, Calendar } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";

type RecordType = "entrada" | "salida";

interface ClockRecord {
  id: string;
  type: RecordType;
  time: string;
  date: string;
  verified: boolean;
  photoUrl?: string;
  userName: string;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function getCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getTodayKey() {
  return new Date().toLocaleDateString("es-ES");
}

export default function FichajePage() {
  const { currentUser } = useUser();
  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load shared history
  useEffect(() => {
    const savedRecords = localStorage.getItem("barconnect_history");
    if (savedRecords) {
      setRecords(JSON.parse(savedRecords));
    }
    setIsLoaded(true);
  }, []);

  // Save shared history
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("barconnect_history", JSON.stringify(records));
    }
  }, [records, isLoaded]);

  const todayStr = getTodayKey();
  const todayRecords = records.filter((r) => r.date === todayStr || r.date === "Hoy");
  const previousRecords = records.filter((r) => r.date !== todayStr && r.date !== "Hoy");

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      setCapturing(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      registerWithoutPhoto();
    }
  }

  function stopCamera() {
    cameraStream?.getTracks().forEach((t) => t.stop());
    setCameraStream(null);
    setCapturing(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const photoUrl = canvas.toDataURL("image/jpeg", 0.8);

    stopCamera();
    registerRecord(photoUrl);
  }

  function registerWithoutPhoto() {
    stopCamera();
    registerRecord();
  }

  function registerRecord(photoUrl?: string) {
    if (!currentUser) return;

    // Check last record for THIS user today to determine type
    const userTodayRecords = todayRecords.filter(r => r.userName === currentUser);
    const type: RecordType = userTodayRecords.length % 2 === 0 ? "entrada" : "salida";

    const newRecord: ClockRecord = {
      id: Date.now().toString(),
      type,
      time: getCurrentTime(),
      date: todayStr,
      verified: !!photoUrl,
      photoUrl,
      userName: currentUser,
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Update the clockedIn status in localStorage for the dashboard to pick up
    localStorage.setItem(`clockedIn_${currentUser}`, JSON.stringify(type === "entrada"));
  }

  const hasClockedIn = todayRecords.filter(r => r.userName === currentUser).length % 2 !== 0;

  return (
    <PageWrapper>
      <AppHeader title="Fichaje" />

      {/* Camera overlay */}
      {capturing && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col max-w-[430px] left-1/2 -translate-x-1/2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 object-cover w-full"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex items-center justify-center gap-6 py-6 bg-black">
            <button
              onClick={registerWithoutPhoto}
              className="text-white/60 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <Camera size={28} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="px-4 pt-5">
        {/* Clock display */}
        <div className="rounded-xl border border-outline-variant bg-surface-white p-5 mb-5 shadow-sm">
          <div className="text-4xl font-bold text-on-surface tabular-nums text-center">
            {getCurrentTime()}
          </div>
          <p className="text-sm text-secondary text-center mt-1 capitalize">
            {getCurrentDate()}
          </p>
          <p className="text-xs text-on-surface-variant text-center mt-3 leading-relaxed px-4">
            Asegúrate de estar en tu puesto de trabajo. Se tomará una fotografía de
            verificación al registrar.
          </p>
          <button
            onClick={startCamera}
            className={`mt-4 w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 active:opacity-80 transition-all ${
              hasClockedIn 
                ? "bg-error-container text-on-error-container" 
                : "bg-primary text-on-primary"
            }`}
          >
            <Camera size={18} />
            {hasClockedIn ? "Fichar Salida" : "Fichar Entrada"}
          </button>
        </div>

        {/* Today's history */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
            Historial de Hoy
            <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
              Compartido
            </span>
          </h2>
          <div className="flex flex-col gap-2">
            {todayRecords.length > 0 ? (
              todayRecords.map((record) => (
                <ClockRecordCard key={record.id} record={record} isCurrentDate />
              ))
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-4 italic">
                No hay registros hoy
              </p>
            )}
          </div>
        </div>

        {/* Previous records */}
        {previousRecords.length > 0 && (
          <div className="mb-4">
            <h2 className="text-base font-semibold text-on-surface mb-3">Anteriores</h2>
            <div className="flex flex-col gap-2">
              {previousRecords.map((record) => (
                <ClockRecordCard key={record.id} record={record} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

function ClockRecordCard({ record, isCurrentDate }: { record: ClockRecord; isCurrentDate?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant bg-surface-white hover:bg-surface-low transition-colors">
      {/* Photo placeholder */}
      <div className="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/30">
        {record.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={record.photoUrl} alt="foto" className="w-full h-full object-cover" />
        ) : (
          <Clock size={18} className="text-on-surface-variant" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-on-surface">
            {record.userName}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
            record.type === "entrada" 
              ? "bg-green-100 text-green-700" 
              : "bg-amber-100 text-amber-700"
          }`}>
            {record.type}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-semibold text-secondary tabular-nums">
            {record.time}
          </span>
          {record.verified && (
            <span className="flex items-center gap-0.5 text-xs text-[#009668]">
              <CheckCircle2 size={11} />
              Verificado
            </span>
          )}
        </div>
      </div>

      {!isCurrentDate && (
        <div className="flex items-center gap-1 text-xs text-on-surface-variant shrink-0">
          <Calendar size={11} />
          {record.date}
        </div>
      )}
    </div>
  );
}
