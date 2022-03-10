//#region Room events
export const ROOMS_LIST = "rooms.list";
export const ROOMS_GET = "rooms.get";
export const ROOMS_GET_ID = "rooms.get.id";
export const ROOMS_CREATE = "rooms.create";
export const ROOMS_JOIN_OR_CREATE = "rooms.join_or_create";
export const ROOMS_JOIN = "rooms.join";
export const ROOMS_LEAVE = "rooms.leave";

export const BROADCAST_ROOMS_CREATED = "broadcast.rooms.created";
export const BROADCAST_ROOMS_CONNECTED = "broadcast.rooms.connected";
export const BROADCAST_ROOMS_DISCONNECTED = "broadcast.rooms.disconnected";
export const BROADCAST_ROOMS_STATE_UPDATED = "broadcast.rooms.state_updated"
export const BROADCAST_ROOMS_DELETED = "broadcast.rooms.deleted";

export const PLAYERS_WALK = "players.walk";
export const PLAYERS_JUMP = "players.jump";
export const PLAYERS_SHOT = "players.shot";
//#endregion

//#region Room states
export const ROOMS_STATE_UNEXIST = 'unexistant'
export const ROOMS_STATE_LOBBY = 'lobby';
export const ROOMS_STATE_INGAME = 'ingame';
export const ROOMS_STATE_ENDGAME = 'endgame';

export const ROOMS_USER_STATE_AFK = 0;
export const ROOMS_USER_STATE_ONLINE = 1;
//#endregion

//#region Room types
export const ROOMS_MODE_DEATHMATCH = 'dm'
export const ROOMS_MODE_TEAM = 'tdm';
export const ROOMS_MODE_CTF = 'ctf';
export const ROOMS_MODE_CTP = 'cp';

export const ROOMS_TYPES = [
    ROOMS_MODE_DEATHMATCH,
    ROOMS_MODE_TEAM,
    ROOMS_MODE_CTF,
    ROOMS_MODE_CTP
]
//#endregion

export const PROFILE_PREFIX = 'p_';
export const ROOM_PREFIX = 'r_';
export const ROOM_NAME_PREFIX = 'rn_';

export const ROOM_PROFILE_PREFIX = 'RP_';
export const PROFILE_ROOM_PREFIX = 'PR_';
export const PROFILE_POSITION_PREFIX = 'PP_';
export const ROOM_PROFILE_POSITION_PREFIX = 'RPP_';

export const ROOM_NAME_REGEX = /[A-Za-z0-9А-Яа-я\ \_\:\№\"\?\!\-\+\=\*\/\#\@\^\,\.\(\)\[\]\{\}\<\>\$\%\;\&]*/;
export const ROOM_DEFAULT_VOLUME = 10;
export const ROOM_MAX_VOLUME = 100;
export const MIN_ROOM_NAME_LENGTH = 0;
export const MAX_ROOM_NAME_LENGTH = 20;
export const MAX_PASSWORD_LENGTH = 20;


export const PLAYER_POSITION_TEMPLATE = {
    id: null,
    key: null,
    //TODO: Replace with random based on platform locations
    x: 800,
    y: 400,
    time: null
}
export const PLAYER_POSITION_FIELD_LIST = Object.keys(PLAYER_POSITION_TEMPLATE);
