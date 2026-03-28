"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FileUp, File, Loader2, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/context/LanguageContext";

export default function UploadPage() {
  const { language, t } = useLanguage();
  const upT = t('upload');
  const commonT = t('common');
  
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [quizLanguage, setQuizLanguage] = useState<string>(language);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles.some(f => f.type === 'application/pdf') && acceptedFiles.length > 1) {
        setErrorText(language === 'es' ? "Solo puedes subir 1 PDF a la vez." : "You can only upload 1 PDF at a time.");
        return;
      }
      setFiles(acceptedFiles.slice(0, 2)); // Máx 2 archivos gráficos
      setErrorText(null);
    }
  }, [language]);

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
      files.forEach(f => formData.append("file", f));
      formData.append("language", quizLanguage);

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
        throw new Error(errorData.error || (language === 'es' ? "Error al procesar el archivo" : "Error processing file"));
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
      <div className="text-center space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-4xl font-black tracking-tight">{upT.title}</h1>
        <p className="text-muted-foreground text-lg">{upT.subtitle}</p>
      </div>

      <Card className="w-full shadow-2xl border-primary/20 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="text-xl font-bold">{language === 'es' ? "Archivos y Configuración" : "Files & Configuration"}</CardTitle>
          <CardDescription>{upT.dropzoneSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 text-foreground">
          {!isProcessing ? (
            <>
            {errorText && (
              <p className="mt-4 text-sm font-bold text-destructive bg-destructive/10 py-3 px-4 rounded-xl border border-destructive/20 animate-in shake duration-300">
                {commonT.error}: {errorText}
              </p>
            )}

            <div className="space-y-4">
              <label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" /> {upT.selectLanguage}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl border-2">
                <Button 
                  variant={quizLanguage === 'es' ? "default" : "ghost"} 
                  className={`rounded-xl font-bold h-11 ${quizLanguage === 'es' ? 'shadow-md' : ''}`}
                  onClick={() => setQuizLanguage('es')}
                >
                  Español
                </Button>
                <Button 
                  variant={quizLanguage === 'en' ? "default" : "ghost"} 
                  className={`rounded-xl font-bold h-11 ${quizLanguage === 'en' ? 'shadow-md' : ''}`}
                  onClick={() => setQuizLanguage('en')}
                >
                  English
                </Button>
              </div>
            </div>

            {files.length === 0 ? (
                <div 
                  {...getRootProps()} 
                  className={`
                    border-4 border-dashed rounded-[2rem] p-16 text-center cursor-pointer transition-all duration-300
                    ${isDragActive ? 'border-primary bg-primary/5 scale-[0.98]' : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/50'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="p-6 bg-primary/10 rounded-3xl shadow-inner">
                      <FileUp className="h-12 w-12 text-primary animate-bounce" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-black">
                        {upT.dropzoneTitle}
                      </p>
                      <p className="text-muted-foreground font-medium">
                        {language === 'es' ? "o haz clic para explorar tus carpetas" : "or click to browse your folders"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in zoom-in-95 duration-300">
                  {files.map((file, idx) => (
                    <div key={idx} className="border-2 rounded-2xl p-4 flex items-center justify-between bg-card shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <File className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black line-clamp-1">{file.name}</p>
                          <p className="text-xs text-muted-foreground font-bold uppercase">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="rounded-xl text-destructive hover:bg-destructive/10 font-bold">
                        {commonT.delete}
                      </Button>
                    </div>
                  ))}
                  {files.length === 1 && files[0].type.startsWith('image') && (
                    <div {...getRootProps()} className="border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors font-bold text-sm text-muted-foreground">
                      <input {...getInputProps()} />
                      + {language === 'es' ? "Agregar otra imagen (opcional)" : "Add another image (optional)"}
                    </div>
                  )}
                </div>
              )}

              <Button 
                className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50" 
                disabled={files.length === 0}
                onClick={handleProcess}
              >
                {upT.generateBtn}
              </Button>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
              {progress < 100 ? (
                <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                   <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                </div>
              ) : (
                <CheckCircle2 className="h-16 w-16 text-success animate-bounce text-green-500 fill-success/10" />
              )}
              
              <div className="text-center space-y-4 w-full max-w-xs">
                <p className="text-lg font-bold">
                  {progress < 30 && (language === 'es' ? "Leyendo documento..." : "Reading document...")}
                  {progress >= 30 && progress < 70 && (language === 'es' ? "Analizando con Gemini AI..." : "Analyzing with Gemini AI...")}
                  {progress >= 70 && progress < 100 && (language === 'es' ? "Creando preguntas mágicas..." : "Creating magic questions...")}
                  {progress === 100 && (language === 'es' ? "¡Listo! Redirigiendo..." : "Ready! Redirecting...")}
                </p>
                <div className="space-y-2">
                  <Progress value={progress} className="h-3 w-full rounded-full" />
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{progress}%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
