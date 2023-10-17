import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as jwkToPem from 'jwk-to-pem'
import * as config from 'config';

const issuer = config.get<string>("auth.issuer");
const audience = config.get<string>("auth.audience");

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const jwk = await this.getPublicJWK(token);
      const certString: string = jwkToPem(jwk.keys[0]);

      const payload = await this.jwtService.verifyAsync(token, {
        publicKey: certString,
        algorithms: ['RS256'],
        issuer: issuer,
        audience: audience
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async getPublicJWK(token: string): Promise<jwkToPem.JWK[]> {
    const decodedToken = this.jwtService.decode(token) as any;

    const res = await fetch(`${decodedToken.iss}/.well-known/jwks.json`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  }
}