// import fs from 'fs';
// import { InjectionToken } from '@nestjs/common';
// import { PoolConfig } from 'mariadb';

// function readConfigJson() {
//   try {
//     const configFile = fs.readFileSync('config.json', 'utf-8');
//     const config = JSON.parse(configFile);
//     return config;
//   } catch (error) {
//     console.error('Error reading config.json:', error);
//     return null;
//   }
// }

// export const config = readConfigJson();

export const POOL_CONFIG = "POOL_CONFIG";