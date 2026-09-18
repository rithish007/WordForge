import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import './entry.css';
import './theme.css';
import './review.css';
import './editor.css';
import './design.css';
import './studio.css';
import {AIProvider} from '@/components/AIConnection';
export const metadata:Metadata={title:'WorldForge · Warehouse lab',description:'Local warehouse robot planning and simulation workspace.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script src="/theme.js"/></head><body><AIProvider>{children}</AIProvider><Script src="/interaction.js" strategy="afterInteractive"/></body></html>;}
