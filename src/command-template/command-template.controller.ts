import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CommandTemplate, COMMAND_TEMPLATE_REPOSITORY } from './command-template.entity';
import {CommandTemplateParameter} from './command-template-parameter.entity';
import { Inject } from '@nestjs/common';
import { CommandRunResult } from '../command-run-result/command-run-result.entity';



@Controller('command-templates')
export class CommandTemplatesController {
    constructor(
        @Inject(COMMAND_TEMPLATE_REPOSITORY)
        private commandTemplate: typeof CommandTemplate
    ) {}

    @Get()
    async findAll(): Promise<Partial<CommandTemplate>[]> {
        const res = await this.commandTemplate.findAll({include:[{model:CommandTemplateParameter, as:'parameters'}]});
        return res;
    }

    @Get('/:id')
    async findById(@Param('id') id: number): Promise<Partial<CommandTemplate>> {
        const res = await this.commandTemplate.findByPk(id,{include:[{model:CommandTemplateParameter, as:'parameters'}]});
        return res;
    }

    @Get(':id/parameters')
    async findTemplateParameters(@Param('id') id: number): Promise<CommandTemplateParameter[]> {
        const res = await CommandTemplateParameter.findAll({where:{commandTemplateId:id}});
        return res;
    }

    @Get('commandRunResults')
    async findCommandRunResults(): Promise<CommandRunResult[]> {
        const res = await CommandRunResult.findAll({include:[{model:CommandTemplate, as:'commandTemplate'}]});
        return res;
    }
}
