/**
 * گفتگوهای ثبت‌نام: هر هفته یک گفتگوی `week` و یک `general` (ساخته‌شده هنگام
 * ثبت‌نام). گزارش دانشجو و بازخورد استاد/معلم/مدیر پیام در همین گفتگوهاست، و
 * وضعیت کارت هفته (`*Status`) از نقش فرستنده‌ی آخرین پیام عوض می‌شود.
 */
import {
  appendMessage,
  assertEnrollmentAccess,
  canAccessEnrollment,
  findEnrollment,
  messagesOf,
  participantIds,
  requireUser,
} from '../domain';
import { HttpError, ok } from '../http';
import type { Router } from '../router';
import {
  nowIso,
  paginate,
  type Store,
  type StoredConversation,
  type StoredMessage,
  type StoredUser,
} from '../store';

import { storageUrl } from './files';

const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

function conversationDto(store: Store, conversation: StoredConversation, viewerId: string) {
  const enrollment = findEnrollment(store, conversation.enrollmentId);
  const messages = messagesOf(store, conversation.id);
  const last = messages[messages.length - 1];
  const read = conversation.readStates.get(viewerId)?.lastReadSequence ?? 0;
  return {
    id: conversation.id,
    enrollmentId: conversation.enrollmentId,
    weekId: conversation.weekId,
    participantIds: participantIds(store, enrollment),
    type: conversation.type,
    lastMessageSequence: last?.sequence ?? 0,
    lastMessageAt: last?.createdAt ?? null,
    readStates: [...conversation.readStates].map(([userId, state]) => ({
      userId,
      lastReadSequence: state.lastReadSequence,
      lastReadAt: state.lastReadAt,
    })),
    unreadCount: messages.filter(
      (message) => message.sequence > read && message.senderId !== viewerId
    ).length,
    createdAt: conversation.createdAt,
    updatedAt: last?.createdAt ?? conversation.updatedAt,
  };
}

function messageDto(store: Store, message: StoredMessage) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: { id: message.senderId, role: message.senderRole },
    text: message.text,
    fileIds: message.fileIds,
    files: message.fileIds.map((id) => ({ id, path: storageUrl(store, id) })),
    rating: message.rating,
    sequence: message.sequence,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

function loadConversation(store: Store, user: StoredUser, id: string): StoredConversation {
  const conversation = store.conversations.get(id);
  if (!conversation) throw new HttpError(404, 'Conversation not found');
  assertEnrollmentAccess(store, user, findEnrollment(store, conversation.enrollmentId));
  return conversation;
}

export function registerConversationRoutes(router: Router, store: Store): void {
  router.register('get', '/api/v1/conversations', (context) => {
    const user = requireUser(store, context);
    const enrollmentId = context.query.get('enrollmentId');
    const rows = [...store.conversations.values()].filter((conversation) => {
      if (enrollmentId && conversation.enrollmentId !== enrollmentId) return false;
      const enrollment = store.enrollments.get(conversation.enrollmentId);
      return Boolean(enrollment) && canAccessEnrollment(store, user, enrollment!);
    });
    const paged = context.query.has('page') || context.query.has('limit');
    const items = paged ? paginate(rows, context.query).data : rows;
    return ok(items.map((conversation) => conversationDto(store, conversation, user.id)));
  });

  router.register('get', '/api/v1/conversations/{id}/messages', (context) => {
    const user = requireUser(store, context);
    const conversation = loadConversation(store, user, context.params.id!);
    const all = messagesOf(store, conversation.id);
    const before = Number(context.query.get('beforeSequence')) || null;
    const after = Number(context.query.get('afterSequence')) || null;
    const limit = Math.min(
      MAX_MESSAGE_LIMIT,
      Math.max(1, Number(context.query.get('limit')) || DEFAULT_MESSAGE_LIMIT)
    );

    if (after !== null) {
      const newer = all.filter((message) => message.sequence > after);
      return ok({
        data: newer.slice(0, limit).map((message) => messageDto(store, message)),
        hasNextPage: newer.length > limit,
      });
    }
    const older = before === null ? all : all.filter((message) => message.sequence < before);
    return ok({
      data: older.slice(-limit).map((message) => messageDto(store, message)),
      hasNextPage: older.length > limit,
    });
  });

  router.register('post', '/api/v1/conversations/{id}/messages', (context) => {
    const user = requireUser(store, context);
    const conversation = loadConversation(store, user, context.params.id!);
    const enrollment = findEnrollment(store, conversation.enrollmentId);
    if (enrollment.status === 'cancelled') throw new HttpError(400, 'Enrollment is cancelled.');

    const body = context.body as { text?: string; fileIds?: string[]; rating?: number };
    const text = body.text?.trim() || null;
    const fileIds = body.fileIds ?? [];
    const rating = body.rating ?? null;
    if (!text && fileIds.length === 0 && rating === null) {
      throw new HttpError(422, 'Unprocessable Entity', { text: 'message must have text, files or rating' });
    }
    if (rating !== null) {
      // برنامه امتیاز شایستگی را فقط از معلم راهنما و مدیر مدرسه می‌فرستد.
      if (user.roleName !== 'teacher' && user.roleName !== 'school_admin') {
        throw new HttpError(403, 'Only teachers and school admins can rate.');
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new HttpError(422, 'Unprocessable Entity', { rating: 'rating must be an integer from 1 to 5' });
      }
    }
    for (const id of fileIds) {
      const file = store.files.get(id);
      if (!file || file.status !== 'confirmed') {
        throw new HttpError(422, 'Unprocessable Entity', { fileIds: `file ${id} is not confirmed` });
      }
    }

    const message = appendMessage(store, conversation, user, { text, fileIds, rating });
    return ok(messageDto(store, message), 201);
  });

  router.register('patch', '/api/v1/conversations/{id}/read', (context) => {
    const user = requireUser(store, context);
    const conversation = loadConversation(store, user, context.params.id!);
    const messages = messagesOf(store, conversation.id);
    conversation.readStates.set(user.id, {
      lastReadSequence: messages[messages.length - 1]?.sequence ?? 0,
      lastReadAt: nowIso(),
    });
    return { status: 200 };
  });
}
