import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class PerfTestService {
    constructor(){

    }

    runPerfTest(command:string) {
        return new Promise<string>((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                reject(error);
                } else if (stderr) {
                reject(stderr);
                } else {
                resolve(stdout);
                }
            });
        });
    }
}

