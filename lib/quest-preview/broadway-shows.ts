/** Selected NYC musicals checked 2026-11-16 against official current listings.
 * https://www.broadway.org/info/current-new-york-broadway-shows
 * https://broadwaydirect.com/shows/in/november/musicals/
 * One title per sign across the entire Broadway composition. */
export const BROADWAY_PROGRAM={
 entrances:['SIX','WICKED','THE LION KING'],
 billboards:['HAMILTON','CHICAGO','ALADDIN','MJ','HADESTOWN','THE OUTSIDERS','THE GREAT GATSBY'],
 marquees:['JUST IN TIME','THE BOOK OF MORMON'],
 posters:['GALILEO','THE LOST BOYS']
} as const;
export const BROADWAY_SHOWS=Object.values(BROADWAY_PROGRAM).flat();
