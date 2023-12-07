import { Injectable } from '@nestjs/common';

const { Parser, AST } = require('node-sql-parser');

@Injectable()
export class SqlParserService {
    private parser: any;

    constructor() {
        this.parser = new Parser();
    }

    parse(sql: string): any {
        const ast = this.parser.astify(sql);
        return ast;
    }

    parseSelect(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'select') {
            return ast;
        }
        else {
            throw new Error('sql is not a select statement');
        }
    }

    parseInsert(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'insert') {
            return ast;
        }
        else {
            throw new Error('sql is not a insert statement');
        }
    }

    parseUpdate(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'update') {
            return ast;
        }
        else {
            throw new Error('sql is not a update statement');
        }
    }

    parseDelete(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'delete') {
            return ast;
        }
        else {
            throw new Error('sql is not a delete statement');
        }
    }

    parseCreate(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'create') {
            return ast;
        }
        else {
            throw new Error('sql is not a create statement');
        }
    }

    parseAlter(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'alter') {
            return ast;
        }
        else {
            throw new Error('sql is not a alter statement');
        }
    }

    parseDrop(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'drop') {
            return ast;
        }
        else {
            throw new Error('sql is not a drop statement');
        }
    }

    parseTruncate(sql: string): any {
        const ast = this.parser.astify(sql);
        if (ast.type === 'truncate') {
            return ast;
        }
        else {
            throw new Error('sql is not a truncate statement');
        }
    }

}
