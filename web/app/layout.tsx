import type {Metadata} from 'next';
import './globals.css';
import './entry.css';
import './theme.css';
import './review.css';
export const metadata:Metadata={title:'WorldForge · Warehouse lab',description:'Local warehouse robot planning and simulation workspace.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script src="/theme.js"/></head><body>{children}</body></html>;}
