import fs from 'fs';
import path from "node:path";
import { Agent, fetch, Response } from 'undici';

export class RetrieveAccountsUseCase {
    constructor() {}

    async execute(): Promise<Response | undefined> {
      
        try{
            const response = await fetch("https://commercial-bank-api.subspace.site/api/simulation/accounts/", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Id': 'thoh'
                },
            });
    
            if (!response.ok) {
                throw new Error(`Failed to retrieve accounts: ${response.statusText}`);
            } else{
                return response;
            }
        } catch (error: unknown) {
            console.error(`Failed to retrieve accounts:`, (error as Error).message);
            return undefined;
        }
    }
}