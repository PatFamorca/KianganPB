export function teamsForFour(players:any[],mode?:string):string[][];
export function roundRobin(ids:string[]):Array<{a:string;b:string;round:null}>;
export function singleElimination(ids:string[]):Array<Array<{a:string|null;b:string|null;winner:null}>>;
export function doubleElimination(ids:string[]):any;
export function nextDoubleRound(state:any):Array<{a:string;b:string;final:boolean}>;
export function scoreValid(a:number,b:number,target?:number,winBy?:number):boolean;
