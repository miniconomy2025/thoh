import fs from 'fs';
import path from "node:path";
import { Agent, fetch } from 'undici';

export class RetrieveAccountsUseCase {
    constructor() {}

    async execute(): Promise<{success:string, accounts: []} | undefined> {
        const agent = new Agent({
            connect: {
                cert : fs.readFileSync(path.join(__dirname, 'thoh-client.crt')),
                key : fs.readFileSync(path.join(__dirname, 'thoh-client.key')),
                ca : fs.readFileSync(path.join(__dirname, 'root-ca.crt')),
                rejectUnauthorized: false
            }
        });

        try{
            const response = await fetch("https://commercial-bank-api.projects.bbdgrad.com/simulation/accounts/", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                dispatcher: agent
            });
    
            if (!response.ok) {
                throw new Error(`Failed to retrieve accounts: ${response.statusText}`);
            } else{
                return await response.json() as {success:string, accounts: []};
            }
        } catch (error: unknown) {
            console.error(`Failed to retrieve accounts:`, (error as Error).message);
            return undefined;
        }
    }
}