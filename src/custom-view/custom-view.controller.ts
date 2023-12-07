import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CustomView, CUSTOM_VIEW_REPOSITORY } from './custom-view.entity';
import { CustomViewParameter } from './custom-view-parameter.entity';
import { Inject } from '@nestjs/common';


@Controller('custom-views')
export class CustomViewController {
    constructor(
        @Inject(CUSTOM_VIEW_REPOSITORY)
        private customView: typeof CustomView) { }

    @Post()
    async create(@Body() customView: CustomView): Promise<CustomView> {
        const res = await this. customView.create({
            name: customView.name,
            description: customView.description,
            viewSql: customView.viewSql,
            parameters: customView.parameters
        }, {
            include: [{ model: CustomViewParameter, as: 'parameters' }]
        });
        return res;
    }

    @Get()
    async findAll() {
        const res = await this.customView.findAll({ include: [{ model: CustomViewParameter, as: 'parameters' }] });
        return res;
    }


    @Put(':id')
    async update(@Param('id') id: string, @Body() customView: CustomView): Promise<void> {
        await this.customView.update(
            {
                name: customView.name,
                description: customView.description,
                viewSql: customView.viewSql
            },
            {
                where: {
                    id: id
                }
            }
        );

        await CustomViewParameter.destroy({where: {customViewId: id}});

        for (const parameter of customView.parameters) {
            await CustomViewParameter.create({
                customViewId: id,
                name: parameter.name,
                defaultValue: parameter.defaultValue,
                dataType: parameter.dataType,
            });
        }
    }

    @Delete(':id')
    async destroy(@Param('id') id: number): Promise<number> {
        const res = await this.customView.destroy({ where: { id } });
        return res;
    }
}