'use client';
import WorkoutApp from './WorkoutApp';
import {adapter} from './adapter';
export default function ModernScreen({initialTab='train'}){return <WorkoutApp kind="swings" adapter={adapter} initialTab={initialTab}/>;}
