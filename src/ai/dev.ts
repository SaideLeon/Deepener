import { config } from 'dotenv';
config();

import '@/ai/flows/extract-instructions-from-file.ts';
import '@/ai/flows/generate-academic-text.ts';
import '@/ai/flows/expand-academic-text.ts';
import '@/ai/flows/deepen-academic-text.ts';
import '@/ai/flows/generate-index-flow.ts';
import '@/ai/flows/detect-topic-flow.ts';
