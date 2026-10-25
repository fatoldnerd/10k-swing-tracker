import type {Metadata,Viewport} from 'next';
import '../family/base.css';
import '../family/workout.css';
export const metadata:Metadata={title:'10K Swings — One set closer',description:'Track actual reps through your 10,000 swing challenge. A focused kettlebell training companion.',icons:{icon:'/kettlebell-icon.svg'},manifest:'/manifest.json'};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#171e13'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
