import {NextRequest,NextResponse} from 'next/server';
import {runWeeklyResets} from '@/lib/weekly-reset';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(req:NextRequest){
 const expected=process.env.CRON_SECRET;
 if(!expected||req.headers.get('authorization')!==`Bearer ${expected}`)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{return NextResponse.json(await runWeeklyResets())}
 catch(e){console.error('Weekly reset failed',e);return NextResponse.json({error:'Reset failed'},{status:500})}
}
