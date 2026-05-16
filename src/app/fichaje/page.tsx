"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle2, Clock, Calendar, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/components/UserContext";
import ConfirmModal from "@/components/ConfirmModal";

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function FichajePage() {
  const { currentUser } = useUser();
  const [records, setRecords] = useState<ClockRecord[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const todayStr = getTodayKey();

  // Load shared history
  useEffect(() => {
    const savedRecords = localStorage.getItem("barconnect_history");
    setTimeout(() => {
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
      setIsLoaded(true);
    }, 0);
  }, []);

  // Save shared history and sync status
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("barconnect_history", JSON.stringify(records));
      
      // Sync clockedIn status for current user
      if (currentUser) {
        const userTodayRecords = records.filter(
          (r) => r.userName === currentUser && (r.date === todayStr || r.date === "Hoy")
        );
        // Clocked in if the number of today's records is odd
        const isCurrentlyClockedIn = userTodayRecords.length % 2 !== 0;
        localStorage.setItem(`clockedIn_${currentUser}`, JSON.stringify(isCurrentlyClockedIn));
      }
    }
  }, [records, isLoaded, currentUser, todayStr]);

  // Effect to attach camera stream when video element becomes available
  useEffect(() => {
    if (capturing && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [capturing, cameraStream]);

  const todayRecords = records.filter((r) => r.date === todayStr || r.date === "Hoy");
  const previousRecords = records.filter((r) => r.date !== todayStr && r.date !== "Hoy");

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setCameraStream(stream);
      setCapturing(true);
    } catch (err) {
      console.error("Camera error:", err);
      registerWithoutPhoto();
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCapturing(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0);
        // Reduced quality to 0.5 to save localStorage space
        const photoUrl = canvas.toDataURL("image/jpeg", 0.5);
        stopCamera();
        registerRecord(photoUrl);
      } else {
        registerWithoutPhoto();
      }
    } catch (err) {
      console.error("Capture error:", err);
      registerWithoutPhoto();
    }
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
      id: generateId(),
      type,
      time: getCurrentTime(),
      date: todayStr,
      verified: !!photoUrl,
      photoUrl,
      userName: currentUser,
    };

    setRecords((prev) => [newRecord, ...prev]);
  }

  function deleteRecord(id: string) {
    setRecordToDelete(id);
  }

  function handleConfirmDelete() {
    if (recordToDelete) {
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete));
      setRecordToDelete(null);
    }
  }

  const hasClockedIn = todayRecords.filter(r => r.userName === currentUser).length % 2 !== 0;

  return (
    <PageWrapper>
      <AppHeader title="Fichaje" />

      {/* Camera overlay */}
      <AnimatePresence>
        {capturing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 bottom-0 w-full max-w-[430px] z-[70] bg-black flex flex-col left-1/2 -translate-x-1/2"
          >
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={stopCamera}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="flex-1 object-cover w-full"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex items-center justify-center gap-6 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-black/80 backdrop-blur-md">
              <button
                onClick={registerWithoutPhoto}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors"
              >
                Sin foto
              </button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={capturePhoto}
                className="w-18 h-18 rounded-full border-4 border-white bg-white/10 flex items-center justify-center transition-all hover:bg-white/20"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <Camera size={28} className="text-black" />
                </div>
              </motion.button>
              <button
                onClick={stopCamera}
                className="text-white/60 text-sm font-medium hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="px-4 pt-5 pb-20">
        {/* Clock display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-outline-variant bg-surface-white p-6 mb-6 shadow-sm overflow-hidden relative"
        >
          <div className="relative z-10">
            <div className="text-5xl font-bold text-on-surface tabular-nums text-center tracking-tight">
              {getCurrentTime()}
            </div>
            <p className="text-sm font-medium text-secondary text-center mt-2 capitalize">
              {getCurrentDate()}
            </p>
            <p className="text-xs text-on-surface-variant text-center mt-4 leading-relaxed px-2">
              Se tomará una fotografía de verificación al registrar tu entrada o salida.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={startCamera}
              disabled={!currentUser}
              className={`mt-6 w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
                !currentUser 
                  ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                  : hasClockedIn 
                    ? "bg-error-container text-on-error-container hover:bg-error-container/90" 
                    : "bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              }`}
            >
              <Camera size={20} />
              {hasClockedIn ? "Fichar Salida" : "Fichar Entrada"}
            </motion.button>
            {!currentUser && (
              <p className="text-[10px] text-error text-center mt-2 font-medium">
                Selecciona un perfil para fichar
              </p>
            )}
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
        </motion.div>

        {/* Today's history */}
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              Hoy
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                Compartido
              </span>
            </h2>
          </motion.div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {todayRecords.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {todayRecords.map((record) => (
                  <motion.div
                    key={record.id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <ClockRecordCard 
                      record={record} 
                      isCurrentDate 
                      onDelete={deleteRecord}
                      currentUser={currentUser}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 rounded-2xl border border-dashed border-outline-variant bg-surface-low/50"
              >
                <Clock size={32} className="text-on-surface-variant/30 mb-2" />
                <p className="text-sm text-on-surface-variant italic">
                  No hay registros hoy
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Previous records */}
        {previousRecords.length > 0 && (
          <div className="mb-4">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base font-bold text-on-surface mb-3"
            >
              Anteriores
            </motion.h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-2"
            >
              {previousRecords.map((record) => (
                <motion.div key={record.id} variants={itemVariants} layout>
                  <ClockRecordCard 
                    record={record} 
                    onDelete={deleteRecord}
                    currentUser={currentUser}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar registro?"
        message="Esta acción no se puede deshacer. El registro de fichaje se borrará permanentemente."
        confirmText="Eliminar"
        type="danger"
      />
    </PageWrapper>
  );
}

function ClockRecordCard({ 
  record, 
  isCurrentDate, 
  onDelete,
  currentUser 
}: { 
  record: ClockRecord; 
  isCurrentDate?: boolean;
  onDelete: (id: string) => void;
  currentUser: string | null;
}) {
  const canDelete = currentUser === record.userName;

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-outline-variant bg-surface-white hover:bg-surface-low transition-all shadow-sm group">
      {/* Photo */}
      <div className="w-12 h-12 rounded-xl bg-surface-high flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/30 shadow-inner">
        {record.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={record.photoUrl} alt="foto" className="w-full h-full object-cover" />
        ) : (
          <Clock size={20} className="text-on-surface-variant/40" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-on-surface truncate">
            {record.userName}
          </p>
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
            record.type === "entrada" 
              ? "bg-green-100 text-green-700" 
              : "bg-amber-100 text-amber-700"
          }`}>
            {record.type}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-secondary tabular-nums">
            {record.time}
          </span>
          {record.verified && (
            <motion.span 
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-0.5 text-[10px] font-semibold text-[#009668]"
            >
              <CheckCircle2 size={10} />
              Verificado
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isCurrentDate && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg">
            <Calendar size={10} />
            {record.date}
          </div>
        )}
        
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            className="p-2 text-on-surface-variant/50 hover:text-error hover:bg-error-container/20 rounded-xl transition-all"
            title="Eliminar registro"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

