
export interface Message {
    message: string;
    messageAttestation: string,
    proof: string,
    group: string[],
    reveals: string[],
    denials: string[]
}