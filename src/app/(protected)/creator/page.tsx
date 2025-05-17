'use client';

import React, {useState, useEffect, ChangeEvent} from 'react';
import {
 BookOpen,
 Upload,
 Edit3,
 FileText,
 Loader2,
 Zap,
 ListTree,
 AlertCircle,
 Languages,
 Copy,
 Maximize2,
 Layers,
 Trash2,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {
 Card,
 CardHeader,
 CardTitle,
 CardContent,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {Toaster} from '@/components/ui/toaster';
import {useToast} from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MarkdownToDocx from '@/components/markdown-to-docx';
import { getSession } from "next-auth/react";  
import { Session } from "next-auth";
import {
 extractInstructionsFromFile,
 type ExtractInstructionsFromFileInput,
} from '@/ai/flows/extract-instructions-from-file';
import {
 generateIndexFromTitles,
 type GenerateIndexFromTitlesInput,
} from '@/ai/flows/generate-index-flow';
import {
 generateAcademicText,
 type GenerateAcademicTextInput,
} from '@/ai/flows/generate-academic-text';
import {
 expandAcademicText,
 type ExpandAcademicTextInput,
} from '@/ai/flows/expand-academic-text';
import {
 deepenAcademicText,
 type DeepenAcademicTextInput,
} from '@/ai/flows/deepen-academic-text';
import {
 detectTopicFromIndex,
 type DetectTopicFromIndexInput,
} from '@/ai/flows/detect-topic-flow';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Image from 'next/image';

type CitationStyle = 'APA' | 'ABNT' | 'Sem Normas';
type ActiveTab = 'file' | 'titles';
type LanguageCode = 'pt-BR' | 'pt-PT' | 'en' | 'es' | 'fr';

const languageMap: Record<LanguageCode, string> = {
 'pt-BR': 'Português (Brasil)',
 'pt-PT': 'Português (Portugal)',
 en: 'English',
 es: 'Español',
 fr: 'Français',
};

const DeepPenAIApp = () => {
 const {toast} = useToast();
 const [session, setSession] = useState<Session | null | undefined>();
 const [isLoading, setIsLoading] = useState(true);
 const [activeTab, setActiveTab] = useState<ActiveTab>('file');
 const [file, setFile] = useState<File | null>(null);
 const [fileName, setFileName] = useState<string>('Nenhum ficheiro selecionado');
 const [fileDataUri, setFileDataUri] = useState<string | null>(null);
 const [topicTitles, setTopicTitles] = useState<string>('');
 const [generatedIndex, setGeneratedIndex] = useState<string | null>(null);
 const [detectedTopic, setDetectedTopic] = useState<string | null>(null);
 const [extractedInstructions, setExtractedInstructions] = useState<string | null>(null);
 const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode>('pt-PT');
 const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('pt-PT');
 const [citationStyle, setCitationStyle] = useState<CitationStyle>('Sem Normas');
 const [generatedText, setGeneratedText] = useState<string | null>(null);
 const [isLoadingExtract, setIsLoadingExtract] = useState<boolean>(false);
 const [isLoadingIndex, setIsLoadingIndex] = useState<boolean>(false);
 const [isLoadingTopicDetection, setIsLoadingTopicDetection] = useState<boolean>(false);
 const [isLoadingGenerate, setIsLoadingGenerate] = useState<boolean>(false);
 const [isLoadingExpand, setIsLoadingExpand] = useState<boolean>(false);
 const [isLoadingDeepen, setIsLoadingDeepen] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);
 const [currentTextAreaValue, setCurrentTextAreaValue] = useState<string>('As instruções ou estrutura para geração do texto aparecerão aqui...');

 // All useEffect hooks together
 useEffect(() => {
   const fetchSession = async () => {
     const sess = await getSession();
     setSession(sess);
     setIsLoading(false);
   };
   fetchSession();
 }, []);

 useEffect(() => {
   const instructions = activeTab === 'file' ? extractedInstructions : generatedIndex;
   setCurrentTextAreaValue(instructions || 'As instruções ou estrutura para geração do texto aparecerão aqui...');
 }, [activeTab, extractedInstructions, generatedIndex]);

 useEffect(() => {
   if (activeTab === 'file') {
     const value = detectedLanguage ?? 'pt-PT';
     setTargetLanguage(value);
     setCurrentTextAreaValue(extractedInstructions ?? 'As instruções ou estrutura para geração do texto aparecerão aqui...');
   }
 }, [activeTab, detectedLanguage, extractedInstructions]);

 if (isLoading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <Loader2 className="h-8 w-8 animate-spin" />
     </div>
   );
 }

 if (!session?.user) {
   return null;
 }

 // Add this new component
 const MarkdownTextarea = ({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) => {
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <Textarea
         value={value}
         onChange={onChange}
         placeholder={placeholder}
         className="min-h-[200px] max-h-[400px] font-sans text-sm overflow-y-auto text-foreground dark:text-foreground"
       />
       <div className="hidden md:block p-4 rounded-md border border-input bg-background/50 h-[400px] overflow-y-auto">
         <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-foreground dark:text-foreground">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
         </div>
       </div>
     </div>
   );
 };

 const getLanguageName = (code: LanguageCode | string | undefined): string => {
 return languageMap[code as LanguageCode] || code || 'Desconhecido';
 };

 const currentInstructions =
 activeTab === 'file' ? extractedInstructions : generatedIndex;

 const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
 const selectedFile = event.target.files?.[0];
 if (selectedFile) {
 if (selectedFile.size > 10 * 1024 * 1024) {
 toast({
 title: 'Erro',
 description: 'O arquivo excede o limite de 10MB.',
 variant: 'destructive',
 });
 return;
 }
 setFile(selectedFile);
 setFileName(selectedFile.name);
 setError(null);

 const reader = new FileReader();
 reader.onloadend = () => {
 setFileDataUri(reader.result as string);
 };
 reader.onerror = () => {
 toast({
 title: 'Erro',
 description: 'Falha ao ler o arquivo.',
 variant: 'destructive',
 });
 setError('Falha ao ler o arquivo.');
 setFileDataUri(null);
 };
 reader.readAsDataURL(selectedFile);
 } else {
 setFile(null);
 setFileName('Nenhum ficheiro selecionado');
 setFileDataUri(null);
 }
 };

 const handleExtractInstructions = async () => {
 if (!fileDataUri) {
 toast({
 title: 'Atenção',
 description: 'Por favor, selecione um arquivo primeiro.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingExtract(true);
 setError(null);
 setExtractedInstructions(null);
 setGeneratedText(null);
 setDetectedTopic(null);


 try {
 const input: ExtractInstructionsFromFileInput = {fileUri: fileDataUri};
 const result = await extractInstructionsFromFile(input);
 setExtractedInstructions(result.extractedText);
 setCurrentTextAreaValue(result.extractedText || 'As instruções ou estrutura para geração do texto aparecerão aqui...');


 const lang = result.detectedLanguage.toLowerCase();
 let supportedLang: LanguageCode = 'pt-PT';
 if (Object.keys(languageMap).includes(lang)) {
 supportedLang = lang as LanguageCode;
 } else if (lang === 'pt') {
 supportedLang = 'pt-PT';
 }

 setDetectedLanguage(supportedLang);
 setTargetLanguage(supportedLang);

 toast({
 title: 'Sucesso',
 description: `Instruções extraídas. Idioma detectado: ${getLanguageName(
 supportedLang
 )}.`,
 variant: 'default',
 className: 'bg-accent text-accent-foreground',
 });
 } catch (err: unknown) {
 console.error('Error extracting instructions:', err);
 setError(`Falha ao extrair instruções: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
 toast({
 title: 'Erro na Extração',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingExtract(false);
 }
 };

 const handleGenerateIndex = async () => {
 if (!topicTitles.trim()) {
 toast({
 title: 'Atenção',
 description: 'Por favor, insira os títulos ou tema.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingIndex(true);
 setError(null);
 setGeneratedIndex(null);
 setDetectedTopic(null);
 setGeneratedText(null);

 try {
 const indexInput: GenerateIndexFromTitlesInput = {
 titles: topicTitles,
 targetLanguage: targetLanguage,
 };
 const indexResult = await generateIndexFromTitles(indexInput);
 setGeneratedIndex(indexResult.generatedIndex);
 setCurrentTextAreaValue(indexResult.generatedIndex || 'As instruções ou estrutura para geração do texto aparecerão aqui...');

  if (indexResult.generatedIndex) {
   setIsLoadingTopicDetection(true);
   try {
     const topicInput: DetectTopicFromIndexInput = {
       academicIndex: indexResult.generatedIndex,
       targetLanguage: targetLanguage,
     };
     const topicResult = await detectTopicFromIndex(topicInput);
     setDetectedTopic(topicResult.detectedTopic);
     toast({
       title: 'Sucesso!',
       description: `Índice gerado. Tópico detectado: "${topicResult.detectedTopic}".`,
       variant: 'default',
       className: 'bg-accent text-accent-foreground',
     });
   } catch (topicErr: unknown) {
     console.error('Error detecting topic:', topicErr);
     toast({
       title: 'Índice Gerado (Aviso)',
       description: 'Índice gerado com sucesso, mas falha ao detectar o tópico principal.',
       variant: 'default',
     });
   } finally {
     setIsLoadingTopicDetection(false);
   }
 } else {
    toast({
       title: 'Sucesso!',
       description: 'Índice gerado.',
       variant: 'default',
       className: 'bg-accent text-accent-foreground',
     });
 }

 } catch (err: unknown) {
 console.error('Error generating index:', err);
 setError(`Falha ao gerar índice: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
 toast({
 title: 'Erro ao Gerar Índice',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingIndex(false);
 }
 };

 const handleGenerateText = async () => {
 if (!currentInstructions) {
 toast({
 title: 'Atenção',
 description: 'Não há instruções ou índice para gerar o texto.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingGenerate(true);
 setError(null);
 setGeneratedText(null);
 try {
 const input: GenerateAcademicTextInput = {
 instructions: currentInstructions,
 targetLanguage: targetLanguage,
 citationStyle: citationStyle,
 };
 const result = await generateAcademicText(input);
 setGeneratedText(result.academicText);
 await autoSaveGeneratedWork('gerado', result.academicText);
 toast({
 title: 'Sucesso',
 description: 'Texto acadêmico gerado.',
 variant: 'default',
 className: 'bg-accent text-accent-foreground',
 });
 } catch (err: unknown) {
 console.error('Error generating academic text:', err);
 setError(`Falha ao gerar texto acadêmico: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
 toast({
 title: 'Erro ao Gerar Texto',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingGenerate(false);
 }
 };

 const handleExpandText = async () => {
 if (!generatedText) {
 toast({
 title: 'Atenção',
 description: 'Não há texto gerado para expandir.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingExpand(true);
 setError(null);
 try {
 const input: ExpandAcademicTextInput = {
 academicText: generatedText,
 targetLanguage: targetLanguage,
 citationStyle: citationStyle,
 };
 const result = await expandAcademicText(input);
 setGeneratedText(result.expandedAcademicText);
 await autoSaveGeneratedWork('expandido', result.expandedAcademicText);
 toast({
 title: 'Sucesso',
 description: 'Texto expandido.',
 variant: 'default',
 className: 'bg-accent text-accent-foreground',
 });
 } catch (err: unknown) {
 console.error('Error expanding text:', err);
 setError(`Falha ao expandir texto: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
 toast({
 title: 'Erro ao Expandir',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingExpand(false);
 }
 };

 const handleDeepenText = async () => {
 if (!generatedText) {
 toast({
 title: 'Atenção',
 description: 'Não há texto gerado para aprofundar.',
 variant: 'default',
 });
 return;
 }
 setIsLoadingDeepen(true);
 setError(null);
 try {
 const input: DeepenAcademicTextInput = {
 academicText: generatedText,
 targetLanguage: targetLanguage,
 citationStyle: citationStyle,
 };
 const result = await deepenAcademicText(input);
 setGeneratedText(result.deepenedAcademicText);
 await autoSaveGeneratedWork('aprofundado', result.deepenedAcademicText);
 toast({
 title: 'Sucesso',
 description: 'Texto aprofundado.',
 variant: 'default',
 className: 'bg-accent text-accent-foreground',
 });
 } catch (err: unknown) {
 console.error('Error deepening text:', err);
 setError(`Falha ao aprofundar texto: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
 toast({
 title: 'Erro ao Aprofundar',
 description: err instanceof Error ? err.message : 'Erro desconhecido',
 variant: 'destructive',
 });
 } finally {
 setIsLoadingDeepen(false);
 }
 };

 // Função auxiliar para salvar automaticamente
 const autoSaveGeneratedWork = async (type: 'gerado' | 'expandido' | 'aprofundado', text: string) => {
   if (!text || !currentInstructions) return;
   try {
     await fetch('/api/generated-work/save', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         title: 'Trabalho Gerado',
         topic: detectedTopic,
         instructions: currentInstructions,
         generatedText: text,
         language: targetLanguage,
         citationStyle,
         sourceType: activeTab === 'file' ? 'file' : 'manual',
         sourceContent: activeTab === 'file' ? extractedInstructions : topicTitles,
         paperId: null,
         generationType: type,
       })
     });
     toast({
       title: 'Salvo automaticamente',
       description: `Trabalho ${type} salvo no banco de dados.`,
       className: 'bg-green-600 text-white',
     });
   } catch {
     toast({
       title: 'Erro ao salvar automaticamente',
       description: 'Ocorreu um erro ao salvar o trabalho.',
       variant: 'destructive',
     });
   }
 };

 const handleResetAll = () => {
 setActiveTab('file');
 setFile(null);
 setFileName('Nenhum ficheiro selecionado');
 setFileDataUri(null);
 setTopicTitles('');
 setGeneratedIndex(null);
 setDetectedTopic(null);
 setExtractedInstructions(null);
 setCurrentTextAreaValue('As instruções ou estrutura para geração do texto aparecerão aqui...');
 setDetectedLanguage('pt-PT');
 setTargetLanguage('pt-PT');
 setCitationStyle('Sem Normas');
 setGeneratedText(null);
 setIsLoadingExtract(false);
 setIsLoadingIndex(false);
 setIsLoadingTopicDetection(false);
 setIsLoadingGenerate(false);
 setIsLoadingExpand(false);
 setIsLoadingDeepen(false);
 setError(null);
 const fileInput = document.getElementById('file-upload') as HTMLInputElement;
 if (fileInput) fileInput.value = '';
 toast({
 title: 'Redefinido',
 description: 'Todos os campos foram limpos.',
 variant: 'default',
 });
 };

 const copyToClipboard = () => {
 if (generatedText) {
 navigator.clipboard
 .writeText(generatedText)
 .then(() =>
 toast({
 title: 'Copiado!',
 description:
 'Texto gerado copiado para a área de transferência.',
 className: 'bg-accent text-accent-foreground',
 })
 )
 .catch(() =>
  toast({
    title: 'Erro',
    description: 'Falha ao copiar texto.',
    variant: 'destructive',
  })
 );
 }
 };

 const handleInstructionsChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
   const newValue = e.target.value;
   setCurrentTextAreaValue(newValue);
   if (activeTab === 'file') {
     setExtractedInstructions(newValue);
   } else {
     setGeneratedIndex(newValue);
   }
 };


 return (
  <DashboardLayout user={session?.user ?? undefined}>
  <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
  {/* Main Content */}
  <main className="container mx-auto px-1 sm:px-8 py-1">
  {/* Tabs for Input Method */}
  <Tabs
  value={activeTab}
  onValueChange={value => {
  setActiveTab(value as ActiveTab);
  setGeneratedText(null); // Clear generated text when switching tabs
  setGeneratedIndex(null);
  setDetectedTopic(null);
  // Update target language based on new tab
  if (value === 'file') {
    setTargetLanguage(detectedLanguage || 'pt-PT');
    setCurrentTextAreaValue(extractedInstructions || 'As instruções ou estrutura para geração do texto aparecerão aqui...');
  } else {
    // For 'titles' tab, language is explicitly chosen by user or defaults.
    // Here, we just ensure the displayed instructions are for the current tab.
      setCurrentTextAreaValue(generatedIndex || 'As instruções ou estrutura para geração do texto aparecerão aqui...');
  }
  }}
  className="mb-8"
  >
  <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-xl p-1.5 shadow-inner border border-border/30">
  <TabsTrigger
  value="file"
  className="data-[state=active]:bg-card/90 data-[state=active]:text-primary data-[state=active]:shadow-lg rounded-lg transition-all duration-200 hover:bg-muted/70 py-3 text-base"
  >
  <Upload className="h-5 w-5 mr-2"/>
  Enviar Arquivo
  </TabsTrigger>
  <TabsTrigger
  value="titles"
  className="data-[state=active]:bg-card/90 data-[state=active]:text-primary data-[state=active]:shadow-lg rounded-lg transition-all duration-200 hover:bg-muted/70 py-3 text-base"
  >
  <Edit3 className="h-5 w-5 mr-2"/>
  Digitar Títulos/Tema
  </TabsTrigger>
  </TabsList>

  {/* File Upload Tab */}
  <TabsContent value="file">
  <Card className="rounded-xl shadow-lg overflow-hidden border-t-4 bg-card/70 backdrop-blur-md border-border/50 mt-4">
  <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent p-6 border-b border-border/30">
  <div className="flex items-center gap-4">
  <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
  1
  </div>
  <CardTitle className="text-2xl font-semibold text-primary">
  Enviar Arquivo de Instruções
  </CardTitle>
  </div>
  </CardHeader>
  <CardContent className="p-8">
  <p className="text-muted-foreground mb-6">
  Envie um arquivo (.jpg, .png, .webp, .pdf, .docx, max 10MB). O idioma será detectado automaticamente.
  </p>
  <Label
  htmlFor="file-upload"
  className="block border-2 border-dashed border-primary/40 rounded-lg p-10 text-center bg-background/50 hover:border-primary/70 transition-all cursor-pointer shadow-sm hover:shadow-md backdrop-blur-sm"
  >
  <div className="flex justify-center mb-4">
  <Upload className="h-14 w-14 text-primary/70"/>
  </div>
  <Button
  type="button"
  variant="default"
  size="lg"
  className="mb-3 shadow-md hover:shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
  onClick={() => document.getElementById('file-upload')?.click()}
  >
  <FileText className="mr-2 h-5 w-5"/> Escolher ficheiro
  </Button>
  <Input
  id="file-upload"
  type="file"
  className="hidden"
  onChange={handleFileChange}
  accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
  />
  <p className="text-sm text-muted-foreground">{fileName}</p>
  </Label>
  {fileDataUri && file?.type.startsWith('image/') && (
  <div className="mt-4 border border-border/50 rounded-md overflow-hidden shadow-sm backdrop-blur-sm bg-background/30">
    <Image
      data-ai-hint="document preview"
      src={fileDataUri}
      alt="Preview"
      width={300}
      height={192}
      className="max-h-48 w-auto mx-auto"
    />
  </div>
  )}
  <p className="mt-6 text-sm text-muted-foreground italic">
  Garanta que o arquivo seja claro e legível para resultados ótimos.
  </p>
  <Button
  onClick={handleExtractInstructions}
  disabled={!file || isLoadingExtract}
  className="mt-8 w-full shadow-md hover:shadow-lg bg-gradient-to-r from-accent to-primary/80 hover:from-accent/90 hover:to-primary/70 text-accent-foreground py-3.5 text-lg font-semibold"
  >
  {isLoadingExtract ? (
  <Loader2 className="h-6 w-6 animate-spin mr-2"/>
  ) : (
  <Zap className="h-6 w-6 mr-2"/>
  )}
  Extrair Instruções
  </Button>
  </CardContent>
  </Card>
  </TabsContent>

  {/* Titles/Theme Tab */}
  <TabsContent value="titles">
  <Card className="rounded-xl shadow-lg overflow-hidden border-t-4 border-primary/80 bg-card/70 backdrop-blur-md border-border/50 mt-4">
  <CardHeader className="bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent p-6 border-b border-border/30">
  <div className="flex items-center gap-4">
  <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
  1
  </div>
  <CardTitle className="text-2xl font-semibold text-primary">
  Inserir Títulos ou Tema
  </CardTitle>
  </div>
  </CardHeader>
  <CardContent className="p-8 bg-gradient-to-r from-blue-70 to-blue-80 rounded-xl" >
  <p className="text-2xl font-semibold text-primary text-black mb-6">
  Digite os títulos, tópicos ou o tema geral. Escolha o idioma de geração no topo da página.
  </p>
  <Textarea
  placeholder="Ex: Introdução à Inteligência Artificial, Impactos da IA na Sociedade..."
  value={topicTitles}
  onChange={e => setTopicTitles(e.target.value)}
  className="min-h-[150px] text-base rounded-md shadow-sm focus:shadow-md bg-background/50 border-input focus:border-primary/70 backdrop-blur-sm border-2 border-primary/40 font-semibold text-lg"
  rows={6}
  spellCheck={false}
  />
  <Button
  onClick={handleGenerateIndex}
  disabled={!topicTitles.trim() || isLoadingIndex || isLoadingTopicDetection}
  className="mt-8 w-full shadow-md hover:shadow-lg bg-gradient-to-r from-accent to-primary/80 hover:from-accent/90 hover:to-primary/70 text-accent-foreground py-3.5 text-lg font-semibold"
  >
  {isLoadingIndex || isLoadingTopicDetection ? (
  <Loader2 className="h-6 w-6 animate-spin mr-2"/>
  ) : (
  <ListTree className="h-6 w-6 mr-2"/>
  )}
  Gerar Estrutura/Índice
  </Button>
  </CardContent>
  </Card>
  </TabsContent>
  </Tabs>

  {/* Review and Generate Section */}
  <Card className="rounded-xl shadow-lg overflow-hidden border-t-4 border-accent/80 bg-card/70 backdrop-blur-md border-border/50">
  <CardHeader className="bg-gradient-to-r from-accent/10 via-secondary/5 to-transparent p-6 border-b border-border/30">
  <div className="flex items-center gap-4">
  <div className="bg-gradient-to-br from-accent to-primary/80 text-accent-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
  2
  </div>
  <CardTitle className="text-2xl font-semibold text-accent">
  Revisar, Configurar & Gerar Texto
  </CardTitle>
  </div>
  </CardHeader>
  <CardContent className="p-1 sm:p-8 space-y-8">
  {error && (
  <Alert variant="destructive" className="shadow-md bg-destructive/20 border-destructive/50 backdrop-blur-sm">
  <AlertCircle className="h-5 w-5"/>
  <AlertTitle className="font-semibold">Ocorreu um Erro</AlertTitle>
  <AlertDescription>{error}</AlertDescription>
  </Alert>
  )}

  {/* Instructions/Index Display */}
  <div>
  <Label htmlFor="instructions-display" className="block mb-2 font-semibold">
  {activeTab === 'file' ? 'Instruções Extraídas' : 'Estrutura/Índice Gerado'}
  </Label>
  <MarkdownTextarea
    value={currentTextAreaValue}
    onChange={handleInstructionsChange}
    placeholder="As instruções ou estrutura para geração do texto aparecerão aqui..."
  />
  <p className="mt-2 text-xs text-muted-foreground dark:text-muted-foreground">
  {activeTab === 'file' && extractedInstructions
    ? 'Conteúdo extraído. Pode ser editado diretamente. Para reprocessar, envie novo arquivo.'
    : ''}
  {activeTab === 'titles' && generatedIndex
    ? `Índice gerado${detectedTopic ? ` para o tópico: "${detectedTopic}"` : ''}. Pode ser editado. Para reprocessar, modifique Títulos/Tema e gere novamente.`
    : ''}
  {(activeTab === 'file' && !extractedInstructions && !isLoadingExtract) ||
  (activeTab === 'titles' && !generatedIndex && !isLoadingIndex && !isLoadingTopicDetection)
    ? 'Você pode editar este campo diretamente ou usar as opções acima.'
    : ''}
  </p>
  </div>

  {/* Language and Citation Style Selection */}
  <div className="grid md:grid-cols-2 gap-6 items-end">
  <div>
  <Label className="block mb-2 font-semibold">Idioma de Geração</Label>
  <div className="flex items-center p-3.5 bg-muted/30 rounded-md border border-input shadow-sm backdrop-blur-sm">
  <Languages className="text-primary h-6 w-6 mr-3"/>
  {/* Language Selection */}
  <Select
  value={targetLanguage}
  onValueChange={value => setTargetLanguage(value as LanguageCode)}
  >
  <SelectTrigger className="w-[180px] text-sm py-2 rounded-md border-input bg-background shadow-sm"> 
  <SelectValue placeholder="Selecionar Idioma"/>
  </SelectTrigger>
  <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
  {(Object.keys(languageMap) as LanguageCode[]).map(langCode => (
  <SelectItem
  key={langCode}
  value={langCode}
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  {languageMap[langCode]}
  </SelectItem>
  ))}
  </SelectContent>
  </Select>
  </div>
  <p className="mt-1 text-xs text-muted-foreground">
  {activeTab === 'file'
    ? `Detectado: ${getLanguageName(detectedLanguage)}.`
    : `Use seletor para alterar o idioma.`}
  </p>
  </div>
  <div>
  <Label htmlFor="citation-style" className="block mb-2 font-semibold">
  Formato de Citação
  </Label>
  <Select
  value={citationStyle}
  onValueChange={value => setCitationStyle(value as CitationStyle)}
  >
  <SelectTrigger
  id="citation-style"
  className="w-full py-3 rounded-md shadow-sm focus:shadow-md bg-background/50 border-input hover:border-primary/70 backdrop-blur-sm"
  >
  <SelectValue placeholder="Selecionar Formato"/>
  </SelectTrigger>
  <SelectContent className="bg-popover text-popover-foreground border-border shadow-md">
  <SelectItem
  value="Sem Normas"
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  Sem Normas (Padrão)
  </SelectItem>
  <SelectItem
  value="APA"
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  Normas APA
  </SelectItem>
  <SelectItem
  value="ABNT"
  className="hover:bg-accent/20 focus:bg-accent/30"
  >
  Normas ABNT
  </SelectItem>
  </SelectContent>
  </Select>
  </div>
  </div>

  {/* Generate Text Button */}
  <Button
  onClick={handleGenerateText}
  disabled={
  !currentInstructions ||
  currentInstructions === 'As instruções ou estrutura para geração do texto aparecerão aqui...' ||
  isLoadingGenerate ||
  isLoadingExtract ||
  isLoadingIndex ||
  isLoadingTopicDetection
  }
  className="w-full shadow-md hover:shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-3.5 text-lg font-semibold"
  size="lg"
  >
  {isLoadingGenerate ? (
  <Loader2 className="h-6 w-6 animate-spin mr-2"/>
  ) : (
  <BookOpen className="h-6 w-6 mr-2"/>
  )}
  Gerar Texto ({getLanguageName(targetLanguage)} - {citationStyle})
  </Button>

  {/* Generated Text Display */}
  <div className="sm:ml-1 sm:mr-1 bg-black/60 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50/10 dark:bg-gray-900/50 border-b border-gray-200/20 dark:border-gray-700/30">
        <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100">
          Texto Acadêmico Gerado
        </h3>
        {generatedText && (
          <button
            onClick={copyToClipboard}
            title="Copiar texto"
            className="text-gray-300 dark:text-gray-300 hover:bg-gray-200/20 dark:hover:bg-gray-700/50 rounded p-1.5 transition-colors"
          >
            <Copy className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="p-1 sm:p-8 min-h-[200px]">
        {isLoadingGenerate || isLoadingExpand || isLoadingDeepen ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary-foreground/80 dark:text-primary-foreground/80" />
            <p className="ml-2 mt-3 text-muted-foreground/80 dark:text-muted-foreground/70">
              {isLoadingGenerate && "Gerando texto..."}
              {isLoadingExpand && "Expandindo texto..."}
              {isLoadingDeepen && "Aprofundando texto..."}
            </p>
          </div>
        ) : generatedText ? (
          <div 
            className="bg-white dark:bg-gray-100 p-1 sm:p-8 rounded shadow-sm overflow-auto max-h-[600px]"
            style={{ 
              backgroundImage: "linear-gradient(to bottom, #f9f9f9 0%, white 100%)",
              border: "1px solid #e0e0e0"
            }}
          >
            <div className="
                mr-1 ml-1 sm:mr-24 sm:ml-24 max-w-none
                text-gray-900 dark:text-gray-800
                font-serif prose prose-lg dark:prose-invert
                prose-headings:font-bold prose-headings:text-back-900 dark:prose-headings:text-blue-800
                prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
                prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
                prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
                prose-p:my-4 prose-p:leading-relaxed
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-1
                prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-gray-100
                prose-em:italic
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
                prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg"
                style={{ lineHeight: "1.9", textAlign: "justify" }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedText}</ReactMarkdown>
            </div>

          </div>
        ) : (
          <div 
            className="bg-white dark:bg-gray-100 p-8 rounded shadow-sm h-full flex items-center justify-center"
            style={{ 
              backgroundImage: "linear-gradient(to bottom, #f9f9f9 0%, white 100%)",
              border: "1px solid #e0e0e0"
            }}
          >
            <p className="text-gray-500 dark:text-gray-300 italic text-center">
              O texto acadêmico gerado aparecerá aqui em formato Markdown.
            </p>
          </div>
        )}
      </div>

      {generatedText && !isLoadingGenerate && !isLoadingExpand && !isLoadingDeepen && (
        <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200/20 dark:border-gray-700/30 text-sm text-gray-400 dark:text-gray-400">
          <div>
            Estilo: <span className="font-semibold text-primary-foreground/80 dark:text-primary-foreground/80">{citationStyle}</span>
          </div>
          <div>
            Idioma: <span className="font-semibold text-primary-foreground/80 dark:text-primary-foreground/80">{getLanguageName(targetLanguage)}</span>
          </div>
        </div>
      )}
    </div>
  

  {/* Refinement Options */}
  <div className="mt-6 space-y-4">
  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
  <Button
  onClick={handleExpandText}
  disabled={
  !generatedText || isLoadingExpand || isLoadingGenerate || isLoadingDeepen
  }
  variant="outline"
  className="flex-1 shadow-sm hover:shadow-md border-primary/50 text-primary hover:bg-primary/10 backdrop-blur-sm py-3 text-base"
  >
  {isLoadingExpand ? (
  <Loader2 className="h-5 w-5 animate-spin mr-2"/>
  ) : (
  <Maximize2 className="h-5 w-5 mr-2"/>
  )}
  Expandir Texto
  </Button>
  <Button
  onClick={handleDeepenText}
  disabled={
  !generatedText || isLoadingDeepen || isLoadingGenerate || isLoadingExpand
  }
  variant="outline"
  className="flex-1 shadow-sm hover:shadow-md border-primary/50 text-primary hover:bg-primary/10 backdrop-blur-sm py-3 text-base"
  >
  {isLoadingDeepen ? (
  <Loader2 className="h-5 w-5 animate-spin mr-2"/>
  ) : (
  <Layers className="h-5 w-5 mr-2"/>
  )}
  Aprofundar Texto
  </Button>
  </div>
  <MarkdownToDocx
  markdownContent={generatedText}
  fileName={
    detectedTopic
      ? `DeepPenAI_${detectedTopic.replace(/[\s:]+/g, '_').replace(/[^\w.-]/g, '')}_${citationStyle}_${targetLanguage}`
      : `DeepPenAI_Output_${citationStyle}_${targetLanguage}`
  }
  disabled={isLoadingGenerate || isLoadingExpand || isLoadingDeepen}
  />
  </div>

  <div className="mt-6 space-y-4">
  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">

  {/* Reset Button */}
  <Button
  onClick={handleResetAll}
  variant="destructive"
  className="w-full mt-6 shadow-md hover:shadow-lg bg-destructive/80 hover:bg-destructive/90 text-destructive-foreground backdrop-blur-sm py-3 text-base"
  >
  <Trash2 className="h-5 w-5 mr-2"/>
  Redefinir Tudo
  </Button>

  </div>
  </div>


  


  </CardContent>
  </Card>
  </main>

  {/* Toaster */}
  <Toaster/>
  </div>
  </DashboardLayout>
 );
};

export default DeepPenAIApp;

