/**
 * Convenience enum that maps numeric representation of note
 * to note name.
 */
export enum Pitch {
    /**
     * No note played.
     */
    Rest = 0,
    C = 1,
    Db = 2,
    D = 3,
    Eb = 4,
    E = 5,
    F = 6,
    Gb = 7,
    G = 8,
    Ab = 9,
    A = 10,
    Bb = 11,
    B = 12,
    /**
     * Previous note is held.
     */
    Hold = 13
}
