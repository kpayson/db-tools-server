import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CommandRunResult, COMMAND_RUN_RESULT_REPOSITORY } from './command-run-result.entity';
import { CommandTemplate } from 'src/command-template/command-template.entity';



@Controller('command-run-results')
export class CommandRunResultsController {
    constructor(
        @Inject(COMMAND_RUN_RESULT_REPOSITORY)
        private commandRunResult: typeof CommandRunResult
    ) { }

    @Get()
    async findCommandRunResults(): Promise<CommandRunResult[]> {
        const res = await this.commandRunResult.findAll({ include: [{ model: CommandTemplate, as: 'commandTemplate' }] });
        return res;
    }

    @Get(':id/htmlReport')
    async findById(@Param('id') id: number): Promise<string> {
        const result = await this.commandRunResult.findByPk(id);
        const report = result.htmlReport.toString()
        return JSON.stringify(report);
    }
}
