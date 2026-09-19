# Rule: NestJS feature pattern (gateway)

**2026-09 RabbitMQ split**: gateway used to be a byte-identical duplicate of the `user` service
(`auth`/`user`/`admin`/`student`, each with its own `*.service.ts`/`*.repository.ts` and a
Postgres connection). That is gone, and the same thin-proxy shape has since been extended to
*every* gateway feature, not just those original four — the education-domain features now proxy
to `tutor-service` and email/notification/redis/upload proxy to `third-service`. Gateway is a
thin HTTP edge with **no service or repository layer and no database** for any feature — all
business logic and each domain's Postgres schema live only in the service that owns it. See
`[[gateway-rmq-refactor]]` memory for why and what the message-pattern contract looks like.

> **Current caveat (2026-09-19)**: `sendRpc` and most existing feature controllers' RMQ call
> sites are still commented out mid-migration to Kafka — `src/packages/helpers/rmq.helper.ts`
> has been deleted. The pattern below is still the target shape for RMQ-owned features; verify
> `sendRpc` is actually exported from `@packages/helpers` before relying on it for new work.
> **`AuthController` and a few `kafka.*` demo/relay routes are already migrated** and use
> `this.kafkaProducer.send('<pattern>', payload)` (`KafkaModule`/`KafkaProducer`, not `sendRpc`)
> instead — see `[[kafka-migration-wip]]` for which routes, and `[[kafka-rpc-plumbing]]` for the
> topic-provisioning and exception-filter wiring required on the owning service's side before a
> new Kafka route will work end-to-end (it's more than just adding the producer call here).

- **Layers**: `{name}.controller.ts` + `{name}.module.ts` only. No `{name}.service.ts`, no
  `{name}.repository.ts`. If a change needs new business logic, it goes in the owning service's
  `*.service.ts` behind a new `@MessagePattern`, not here.
- **Controller shape**: keep every route, guard (`@Public()`/`@Roles()`), Zod
  `ZodValidationPipe`, and Swagger decorator exactly as before — validation and auth stay at the
  edge. Replace the handler body with:
  ```ts
  return sendRpc(this.<name>Client, '<feature>.<methodName>', payload);
  ```
  (`<name>Client` is whichever of `userClient`/`tutorClient`/`thirdClient` owns the feature.)
  `sendRpc` (`@packages/helpers`) is the only sanctioned way to call a downstream service — it
  turns the responder's error payload back into the matching `HttpException`. Never call
  `client.send(...)` directly from a controller.
- **`ClientProxy` injection**: `@Inject(<SERVICE>) private readonly <name>Client: ClientProxy`
  (token from `../rmq-clients/rmq-clients.constants`). All three tokens — `USER_SERVICE`,
  `TUTOR_SERVICE`, `THIRD_SERVICE` — are now live: inject whichever one owns the feature you're
  touching (`user` for auth/user/admin/student; `tutor-service` for the education-domain
  features — class/schedule/session/curriculum/chapter/lesson/tuition/exercise/attendance/
  dashboard/report/ai-chat; `third-service` for email/notification/redis/upload). All three
  services have `@MessagePattern` responders wired up — see `../.claude/rules/architecture.md`.
- **Message pattern naming**: `<feature>.<methodName>`, matching the method name on the owning
  service's `*Service` class (e.g. `auth.login` → `AuthService.loginService`,
  `admin.updateStudent` → `AdminService.updateStudent`, `ai.chat` → `tutor-service`'s agents
  feature). Define it as the literal string passed to `sendRpc` — there is no shared constant
  between the two repos, so when you add or rename a pattern, update **both** the gateway call
  site and the owning repo's `*.rpc.controller.ts` `@MessagePattern(...)` together, or requests
  will 404 silently (RMQ has no route table to catch a typo at compile time).
- **Payload shape**: mirror exactly what the owning service's method already takes (see its
  `*.controller.ts`/`*.rpc.controller.ts` for the call signature) — e.g. `{ id, role, data }` for
  `user.updateUser` → `updateOwnProfileService({ id, role, data })`. Build this object from
  `@CurrentUser()` / `@Param()` / the validated body in the gateway controller, same as before;
  only the destination of the call changed (RPC instead of a local service call).
- **Entities still live** under `src/packages/entities/{domain}/` as `{domain}.schema.ts` (Zod),
  `{domain}.dto.ts`, `index.ts` — gateway keeps these for request validation even without a DB.
- **OAuth is the one exception**: `AuthController`'s Google/Facebook routes keep their Passport
  `AuthGuard`/redirect logic here (they need a live `Response` for the browser redirect) — only
  the token-issuance call at the end (`auth.googleLogin`/`auth.facebookLogin`) goes over RPC.
- **Error messages**: use `ERROR_MESSAGES` constants from `src/data/constants/error.constant.ts`
  for anything gateway itself throws directly (e.g. validation-adjacent checks) — errors coming
  back from the owning service already carry their own message through `sendRpc`.
- **Register** every new module in `src/app.module.ts` `imports: [...]`.
- **Route names are plural** (`@Controller('students')`); class/file names are singular.
- **Infra modules**: `src/features/rabbitmq/*` (hand-rolled `amqplib` pub/sub, topic exchange —
  fire-and-forget domain events) and `src/features/rmq-clients/*` (`@nestjs/microservices`
  `ClientsModule`, request/reply RPC) are two separate mechanisms that both happen to use
  RabbitMQ. Don't conflate them: pub/sub is for events nobody needs a reply to; RPC is for
  "gateway needs an answer to return to the HTTP caller."
