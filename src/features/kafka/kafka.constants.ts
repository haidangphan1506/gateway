export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';

/**
 * Topics used via `KafkaProducer.send()` (request-reply). `ClientKafka` only subscribes its
 * consumer to a topic's `<topic>.reply` once `subscribeToResponseOf(topic)` has been called
 * before `connect()` runs — add every request-reply topic here, or `.send()` throws "did not
 * subscribe to the corresponding reply topic". Fire-and-forget `emit()` topics don't need this.
 */
export const KAFKA_REQUEST_TOPICS: string[] = [
  'kafka.echo',
  'kafka.test',
  'kafka.user',
  'kafka.user.error',
  'kafka.test2',
  'auth.register',
  'auth.login',
  'auth.loginByUserCode',
  'auth.refresh',
  'auth.forgotPassword',
  'auth.resetPassword',
  'auth.googleLogin',
  'auth.facebookLogin',
];

/** Topics `KafkaProducer.emit()` fires at, fire-and-forget — no `.reply` subscription needed. */
export const KAFKA_EMIT_TOPICS: string[] = ['kafka.ping'];

/**
 * Every Kafka topic this service touches, for `ensureKafkaTopics()` in `main.ts` to pre-create.
 * Covers the request topics themselves, their `.reply` counterparts (what `subscribeToResponseOf`
 * subscribes to), and the plain emit topics.
 */
export const ALL_KAFKA_TOPICS: string[] = [
  ...KAFKA_REQUEST_TOPICS,
  ...KAFKA_REQUEST_TOPICS.map((topic) => `${topic}.reply`),
  ...KAFKA_EMIT_TOPICS,
];
