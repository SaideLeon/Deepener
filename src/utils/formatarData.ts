import { FormatarDataOptions } from '@/types';

export function formatarData(date: Date): string {   
    const options: FormatarDataOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('pt-BR', options).replace('', ''); 
    return `${formattedDate}`;
}