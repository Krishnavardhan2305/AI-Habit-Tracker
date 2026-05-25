import {format,subDays,startOfWeek,endOfWeek,eachDayOfInterval} from "date-fns";

export const toDateKey=(date)=>{
    return format(date,"yyyy-MM-dd");
}

export const todayKey=toDateKey(new Date());

export const last90Days=()=>{
    const end=new Date();
    const start=subDays(end,89);
    return eachDayOfInterval({start,end}).map(toDateKey);
}

export const CurrentWeekKeys=()=>{
    const today=new Date();
    const start=startOfWeek(today,{weekStartsOn:1});
    const end=endOfWeek(today,{weekStartsOn:1});
    return eachDayOfInterval({start,end}).map(toDateKey);
}

export const lastNDays=(n)=>{
    const end=new Date();
    const start=subDays(end,n-1);
    return eachDayOfInterval({start,end}).map(toDateKey);
}

export const calcStreak=(sortedDateKeys)=>{
    if(!sortedDateKeys.length) return {current:0,longest:0};
    const set=new Set(sortedDateKeys);
    const today=todayKey();
    const yesterday=toDateKey(subDays(new Date(),1));
    let current=0;
    let cursor=new Date();
    if(!set.has(today) && !set.has(yesterday)){
        current=0;
    }
    else
    {
        if(!set.has(today))
        {
            cursor=subDays(cursor,1);
            while(set.has(toDateKey(cursor)))
            {
                current++;
                cursor=subDays(cursor,1);
            }
        }
    }
    const sortedAsc=[...sortedDateKeys].sort();
    let longest=0;
    let run=0;
    let prev=null;
    for(const k of sortedAsc)
    {
        if(prev)
        {
            const d=new Date(k);
            const p=new Date(prev);
            const diff=(d-p)/86400000;
            if(diff===1)
            {
                run++;
            }
            else 
            {
                run=1;
            }
        }
        else
            run=1;
        longest=Math.max(longest,run);
        prev=k;
    }
    return {current,longest};
}