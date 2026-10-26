import {initializeApp} from 'firebase/app';
import {getAuth,GoogleAuthProvider} from 'firebase/auth';
import {getFirestore,Timestamp} from 'firebase/firestore';
import {firebaseConfig as config} from './firebase-config';
const app=config.apiKey&&config.projectId?initializeApp(config,'swing-family'):null;
export const adapter={auth:app?getAuth(app):null,db:app?getFirestore(app):null,googleProvider:new GoogleAuthProvider(),topLevel:true,path:()=>['workouts'],encode:(r,uid)=>({userId:uid,date:Timestamp.fromDate(new Date(r.date)),createdAt:Timestamp.now(),strengthExercise:r.config.strength,kettlebellWeight:r.config.weight,totalTimeMinutes:Math.floor(r.duration/60),totalTimeSeconds:r.duration%60,completed:r.totalReps>=r.config.goal,actualSwings:r.totalReps,totalSwings:r.totalReps,notes:r.notes,rounds:Array.from({length:Math.ceil(r.entries.length/4)},(_,i)=>{const entries=r.entries.slice(i*4,i*4+4);const end=entries.at(-1)?.at||0,start=r.entries[i*4-1]?.at||0;return {id:r.id+'-'+i,workoutId:r.id,roundNumber:i+1,timeMinutes:Math.floor((end-start)/60),timeSeconds:(end-start)%60,createdAt:Timestamp.now()};})})};
