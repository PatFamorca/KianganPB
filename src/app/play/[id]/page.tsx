import PlayerSession from '@/components/PlayerSession';export default function Page({params}:{params:{id:string}}){return <main className='self-main'><PlayerSession id={params.id}/></main>}
