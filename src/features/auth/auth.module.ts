import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FacebookStrategy, GoogleStrategy } from '@packages/strategy';

/**
 * OAuth Passport strategies stay in gateway (they need the live HTTP redirect flow); all other
 * auth business logic is forwarded to the `user` service over RabbitMQ — see `AuthController`.
 */
@Module({
  controllers: [AuthController],
  providers: [GoogleStrategy, FacebookStrategy],
})
export class AuthModule {}
