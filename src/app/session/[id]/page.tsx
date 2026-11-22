import Organizer from '@/components/Organizer';
import ShortSession from '@/app/s/[slug]/page';
export default function Page({params}:{params:{id:string}}){return /^[a-f0-9]{24}$/i.test(params.id)?<main className='self-main'><Organizer id={params.id}/></main>:<ShortSession params={{slug:params.id}}/>}
