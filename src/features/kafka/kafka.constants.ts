export const KAFKA_PRODUCER = 'KAFKA_PRODUCER';

/**
 * Topics used via `KafkaProducer.send()` (request-reply). `ClientKafka` only subscribes its
 * consumer to a topic's `<topic>.reply` once `subscribeToResponseOf(topic)` has been called
 * before `connect()` runs — add every request-reply topic here, or `.send()` throws "did not
 * subscribe to the corresponding reply topic". Fire-and-forget `emit()` topics don't need this.
 */
export const KAFKA_REQUEST_TOPICS: string[] = [
  // ── Kafka built-in ──
  'kafka.echo',
  'kafka.test',
  'kafka.user',
  'kafka.user.error',
  'kafka.test2',
  'kafka.send',
  // ── Auth (user service) ──
  'auth.register',
  'auth.login',
  'auth.loginByUserCode',
  'auth.refresh',
  'auth.forgotPassword',
  'auth.resetPassword',
  'auth.googleLogin',
  'auth.facebookLogin',
  // ── Redis (third service) ──
  'redis.get',
  // ── User (user service) ──
  'user.getUsers',
  'user.getDetailUser',
  'user.getUserByField',
  'user.createUser',
  'user.updateUser',
  'user.updateUserByAdmin',
  'user.updateStatusUser',
  'user.deleteUserByAdmin',
  'user.changePassword',
  // ── Curriculum (tutor service) ──
  'curriculum.create',
  'curriculum.getAll',
  'curriculum.getById',
  'curriculum.update',
  'curriculum.delete',
  'curriculum.generateCode',
  // ── Chapter (tutor service) ──
  'chapter.create',
  'chapter.getAll',
  'chapter.getById',
  'chapter.update',
  'chapter.delete',
  // ── Lesson (tutor service) ──
  'lesson.create',
  'lesson.getAll',
  'lesson.getById',
  'lesson.update',
  'lesson.delete',
  // ── Exercise (tutor service) ──
  'exercise.create',
  'exercise.getAll',
  'exercise.getById',
  'exercise.submit',
  'exercise.grade',
  // ── Tuition (tutor service) ──
  'tuition.create',
  'tuition.getAll',
  'tuition.getSummary',
  'tuition.getById',
  'tuition.update',
  'tuition.delete',
  // ── Class (tutor service) ──
  'class.create',
  'class.update',
  'class.generateCode',
  'class.getAll',
  'class.getById',
  'class.addStudents',
  'class.getStudents',
  'class.getMaterials',
  'class.getWatch',
  'class.delete',
  // ── Schedule (tutor service) ──
  'schedule.create',
  'schedule.createBulk',
  'schedule.getAll',
  'schedule.getByClass',
  'schedule.getById',
  'schedule.update',
  'schedule.delete',
  // ── Session (tutor service) ──
  'session.create',
  'session.createBulk',
  'session.getAll',
  'session.getByClass',
  'session.getById',
  'session.update',
  'session.delete',
  // ── Attendance (tutor service) ──
  'attendance.getBySession',
  'attendance.upsert',
  // ── Dashboard (tutor service) ──
  'dashboard.overview',
  // ── Report (tutor service) ──
  'report.summary',
  'report.attendanceTrend',
  'report.classList',
  // ── Notification (third service) ──
  'notification.create',
  'notification.getAll',
  'notification.markAllAsRead',
  'notification.getById',
  'notification.markAsRead',
  'notification.delete',
  // ── Upload (third service) ──
  'upload.upload',
  'upload.uploadMultiple',
  'upload.download',
  'upload.delete',
  // ── Email (third service) ──
  'email.test',
  // ── AI Chat (tutor service) ──
  'ai.chat',
  'ai.history',
  'ai.clearHistory',
  // ── Health checks ──
  'health.postgres',
  'health.redis',
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
