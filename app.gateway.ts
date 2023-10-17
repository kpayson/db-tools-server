import { WebSocketGateway, OnGatewayInit, 
  OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Inject } from '@nestjs/common';
import { PERF_TEST_RESULT_REPOSITORY } from './src/perf-test/perf-test-result.providers';
import * as config from 'config';
import {exec }  from 'child_process';
import * as fs from 'node:fs';
import { PerfTestResult } from 'src/perf-test/perf-test-result.entity';
import {compile} from 'handlebars';

import {COMMAND_TEMPLATE_REPOSITORY, CommandTemplate} from './src/command-template/command-template.entity';
import { CommandRunResult, COMMAND_RUN_RESULT_REPOSITORY } from 'src/command-run-result/command-run-result.entity';

// import WebSocket
//
import { PerfTestService } from 'src/perf-test/perf-test-runner.service';
import { PerfTestSettings } from 'config/config-types';



@WebSocketGateway({path:'websocket'}) 
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private clients: Socket[] = [];
  constructor(    
    @Inject(PERF_TEST_RESULT_REPOSITORY)
    private perfTestResult: typeof PerfTestResult,
    
    @Inject(COMMAND_TEMPLATE_REPOSITORY)
    private commandTemplateRepo: typeof CommandTemplate,

    @Inject(COMMAND_RUN_RESULT_REPOSITORY)
    private commandRunResultRepo: typeof CommandRunResult,
    ) {

  }

  handleDisconnect(client: Socket) {
    // Handle client disconnection
    const index = this.clients.indexOf(client);
    if (index !== -1) {
      this.clients.splice(index, 1);
    }
  }

  handleConnection(client: Socket, ...args: any[]) {
    // Handle client connection
    this.clients.push(client);
    console.log('connection')
  }

  afterInit(server: Server) {
    // Initialize the websocket gateway
    console.log('afterInit');
  }

  // @SubscribeMessage('test')
  // async handleMessage(client: Socket, message: string) { // @MessageBody() 
  //   console.log("message received: " + message)
  //   try {
  //     const command = `/Users/kenpayson/go/bin/k6 run -e AUTH_SERVER=http://localhost:7007 -e USER_NAME=performance@local.test -e USER_PASSWORD=@labshare@ /Users/kenpayson/Documents/repos/auth-monorepo/packages/auth/test/integration/data-seed/auth-perf-test.js`
  //     const results = await this.perfTestService.runPerfTest(command);
  //     client.send(results);
  //   } catch (err) {
  //     client.send(err);
  //   }
  // }

  // @SubscribeMessage('events')
  // onEvent(client: any, data: any): Observable<WsResponse<number>> {
  //   return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  // }

  @SubscribeMessage('events')
  async onEvent(client: any, data: any){  // : Observable<WsResponse<number>>
    try {
      const {k6Path, authServer, username, password, perfTestScriptPath, reportOutputPath} = config.get<PerfTestSettings>("perfTests");
    //   "perfTests": {
    //     "authServer":"http://localhost:7007",
    //     "username": "performance@local.test",
    //     "password": "@labshare@",
    //     "perfTestScriptPath": "/Users/kenpayson/Documents/repos/auth-monorepo/packages/auth/test/integration/data-seed/auth-perf-test.js",
    //     "k6Path": "/Users/kenpayson/go/bin/k6"
    // }

      const execCommand = `${k6Path} run -e TARGET_VUS=${data.targetVUS} -e REPORT_OUTPUT_PATH=${reportOutputPath}  -e AUTH_SERVER=${authServer} -e USER_NAME=${username} -e USER_PASSWORD=${password} ${perfTestScriptPath}`

      // const results = await this.perfTestService.runPerfTest(command);
      // client.send(results);

      const prom = new Promise((resolve, reject) => {
        exec(execCommand, (error, stdout, stderr) => {
        
        fs.readFile(reportOutputPath, 'utf8', (error, data) => {
          if (error) {
            console.error(`Error: ${error.message}`);
            resolve(error.message);
            return;
          }
          // console.log(`File contents: ${data}`);
          resolve(data);
        });  
        
        })
      })
      const results = await prom;
      
      const createRes = await this.perfTestResult.create({
        connectionId: data.connectionId,
        vus:data.targetVUS, 
        runDate:new Date(), 
        comments:'', 
        htmlReport:results
      });

      client.send(results)
      console.log(results);

    } catch (err) {
      client.send(err);
    }
  }

  @SubscribeMessage('serverJob')
  async onServerJob(client: any, data: any){  // : Observable<WsResponse<number>>
    console.log(client);
    console.log(data);
    try {
      console.log(data);
      const commandTemplate = await this.commandTemplateRepo.findByPk(data.templateId);
      const hbTemplate = compile(commandTemplate.template);
      const execCommand = hbTemplate(data.params);
      console.log(execCommand);

      const prom = new Promise<{data:any, runTime:number}>((resolve, reject) => {
        const startTime = process.hrtime();

        exec(execCommand, (error, stdout, stderr) => {
          const endTime = process.hrtime(startTime);
          const timeInMilliseconds = (endTime[0] * 1000 + endTime[1] / 1000000);

          if(commandTemplate.resultLocationType === 'file') {
            fs.readFile(commandTemplate.resultFilePath, 'utf8', (error, data) => {
              if (error) {
                  console.error(`Error: ${error.message}`);
                  resolve({data:error.message, runTime:0});
                return;
              }
              resolve({data, runTime:timeInMilliseconds});
            });  
          }
          else {
            resolve({data:stdout, runTime:timeInMilliseconds});
          }
        })
      });
      
      const results = await prom;
      client.send(results.data);

      const createRes = await this.commandRunResultRepo.create({
        commandTemplateId:commandTemplate.id,
        parametersJson:JSON.stringify(data.params),
        runDate:new Date(),
        comment:'',
        htmlReport:results.data,
        runTimeMilliseconds:results.runTime
      });



    } catch (err) {
      client.send(err);
    }
  }


  }

  // import {
  //   SubscribeMessage,
  //   WebSocketGateway,
  //   WebSocketServer,
  //   WsResponse,
  // } from '@nestjs/websockets';
  // import { from, Observable } from 'rxjs';
  // import { map } from 'rxjs/operators';
  // import { Server } from 'ws';

  
  // @WebSocketGateway(8080)
  // export class EventsGateway {
  //   @WebSocketServer()
  //   server: Server;
  
  //   @SubscribeMessage('events')
  //   onEvent(client: any, data: any): Observable<WsResponse<number>> {
  //     return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
  //   }
  // }
