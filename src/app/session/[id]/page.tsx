import Organizer from '@/components/Organizer';export default function Page({params}:{params:{id:string}}){return <main className='self-main'><Organizer id={params.id}/></main>}
