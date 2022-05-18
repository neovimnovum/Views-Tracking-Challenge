/* BONUS OPPORTUNITY
It's not great (it's bad) to throw all of this code in one file.
Can you help us organize this code better?
*/

// Why not distributed counters? The load isn't close to 1/second at peak,
// the architecture of the app makes this unlikely (So long as all unique views come from one firm),
// and distributed counters would double our number of reads per function call.

export interface Recording {
  id: string; // matches document id in firestore
  creatorId: string; // id of the user that created this recording
  uniqueViewCount: number;
  viewers: string[];
}

export interface User {
  id: string; // mathes both the user's document id
  uniqueRecordingViewCount: number; // sum of all recording views
}

export enum Collections {
  Users = "Users",
  Recordings = "Recordings"
}
