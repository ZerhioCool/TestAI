"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FileUp, File, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles.some(f => f.type === 'application/pdf') && acceptedFiles.length > 1) {
        setErrorText("Solo puedes subir 1 PDF a la vez.");
        return;
      }
      setFiles(acceptedFiles.slice(0, 2)); // Máx 2 archivos gráficos
      setErrorText(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.heic']
    },
    maxFiles: 2,
    maxSize: 20 * 1024 * 1024, // 20 MB
  });

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setErrorText(null);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append("file", f)); // Enviamos array

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 800);

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar el archivo");
      }

      const data = await response.json();
      setProgress(100);
      
      setTimeout(() => {
        router.push(`/quiz/${data.quizId}`);
      }, 500);

    } catch (error: any) {
      console.error("Upload Error:", error);
      setErrorText(error.message);
      setIsProcessing(false);
      setFiles([]);
      setProgress(0);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sube tu Material</h1>
        <p className="text-muted-foreground">Convierte 1 PDF (máx 3 hojas) o 2 Imágenes en un Quiz interactivo.</p>
      </div>

      <Card className="w-full shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle>Archivos (Máx 20MB en Grupo)</CardTitle>
          <CardDescription>Soportamos PDF, JPG, PNG y HEIC</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isProcessing ? (
            <>
            {errorText && (
              <p className="mt-4 text-sm font-medium text-destructive bg-destructive/10 py-2 px-4 rounded-md">
                Error: {errorText}
              </p>
            )}

            {files.length === 0 ? (
                <div 
                  {...getRootProps()} 
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full">
                      <FileUp className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Arrastra tus archivos aquí
                      </p>
                      <p className="text-xs text-muted-foreground">
                        o haz clic para explorar tus carpetas
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="border rounded-xl p-4 flex items-center justify-between bg-muted/30">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <File className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
                        Quitar
                      </Button>
                    </div>
                  ))}
                  {files.length === 1 && files[0].type.startsWith('image') && (
                    <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                      <input {...getInputProps()} />
                      <p className="text-sm text-muted-foreground">+ Agregar otra imagen (opcional)</p>
                    </div>
                  )}
                </div>
              )}

              <Button 
                className="w-full h-12 text-md shadow-md transition-transform active:scale-95" 
                disabled={files.length === 0}
                onClick={handleProcess}
              >
                Generar Quiz con IA
              </Button>
            </>
          ) : (
            <div className="py-8 flex flex-col items-center space-y-6 animate-in fade-in duration-500">
              {progress < 100 ? (
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              ) : (
                <CheckCircle2 className="h-12 w-12 text-success animate-bounce text-green-500" />
              )}
              
              <div className="text-center space-y-2 w-full max-w-xs">
                <p className="text-sm font-medium">
                  {progress < 30 && "Leyendo documento..."}
                  {progress >= 30 && progress < 70 && "Analizando con Gemini AI..."}
                  {progress >= 70 && progress < 100 && "Creando preguntas mágicas..."}
                  {progress === 100 && "¡Listo! Redirigiendo..."}
                </p>
                <Progress value={progress} className="h-2 w-full" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
