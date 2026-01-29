/**
 * Query keys for Classroom domain
 * Factory pattern for TanStack Query key management
 */

import type { BundleItemType } from '@/domains/classroom/models/domain';

export interface ClassroomListParams {
  page?: number;
  pageSize?: number;
}

export interface EnrollmentListParams {
  page?: number;
  pageSize?: number;
  classroomUuid?: string;
}

export interface AssignmentBundleListParams {
  page?: number;
  pageSize?: number;
  classroomUuid?: string;
}

export interface FeedParams {
  page?: number;
  pageSize?: number;
}

export interface GradingQueueParams {
  page?: number;
  pageSize?: number;
}

export interface ContentSearchParams {
  query?: string;
  type?: BundleItemType | string;
  difficulty?: string;
  part?: number;
  taskType?: string;
  page?: number;
  pageSize?: number;
}

export const classroomKeys = {
  // Root
  all: ['classroom'] as const,

  // ============================================================================
  // CLASSROOM MANAGEMENT
  // ============================================================================
  
  classrooms: () => [...classroomKeys.all, 'classrooms'] as const,
  classroomList: (params?: ClassroomListParams) => 
    [...classroomKeys.classrooms(), 'list', params] as const,
  classroomDetail: (uuid: string) => 
    [...classroomKeys.classrooms(), 'detail', uuid] as const,
  classroomAnalytics: (uuid: string) => 
    [...classroomKeys.classrooms(), 'analytics', uuid] as const,
  classroomDetailedAnalytics: (uuid: string) => 
    [...classroomKeys.classrooms(), 'detailed-analytics', uuid] as const,

  // ============================================================================
  // ENROLLMENTS
  // ============================================================================
  
  enrollments: () => [...classroomKeys.all, 'enrollments'] as const,
  enrollmentList: (params?: EnrollmentListParams) => 
    [...classroomKeys.enrollments(), 'list', params] as const,
  enrollmentDetail: (uuid: string) => 
    [...classroomKeys.enrollments(), 'detail', uuid] as const,
  classroomRoster: (classroomUuid: string) => 
    [...classroomKeys.enrollments(), 'roster', classroomUuid] as const,
  myClassrooms: () => 
    [...classroomKeys.enrollments(), 'my-classrooms'] as const,
  inviteCode: (code: string) => 
    [...classroomKeys.enrollments(), 'invite-code', code] as const,

  // ============================================================================
  // ASSIGNMENT BUNDLES
  // ============================================================================
  
  bundles: () => [...classroomKeys.all, 'bundles'] as const,
  bundleList: (params?: AssignmentBundleListParams) => 
    [...classroomKeys.bundles(), 'list', params] as const,
  bundleDetail: (uuid: string) => 
    [...classroomKeys.bundles(), 'detail', uuid] as const,

  // ============================================================================
  // STUDENT ASSIGNMENTS
  // ============================================================================
  
  studentAssignments: () => [...classroomKeys.all, 'student-assignments'] as const,
  studentAssignmentList: (params?: { page?: number; pageSize?: number }) => 
    [...classroomKeys.studentAssignments(), 'list', params] as const,

  // ============================================================================
  // FEED
  // ============================================================================
  
  feed: () => [...classroomKeys.all, 'feed'] as const,
  classroomFeed: (classroomUuid: string, params?: FeedParams) => 
    [...classroomKeys.feed(), classroomUuid, params] as const,
  teacherFeed: (classroomUuid: string) => 
    [...classroomKeys.feed(), 'teacher', classroomUuid] as const,

  // ============================================================================
  // GRADING
  // ============================================================================
  
  grading: () => [...classroomKeys.all, 'grading'] as const,
  gradingQueue: (params?: GradingQueueParams) => 
    [...classroomKeys.grading(), 'queue', params] as const,
  submissionReview: (submissionUuid: string) => 
    [...classroomKeys.grading(), 'review', submissionUuid] as const,
  gradingStats: () => 
    [...classroomKeys.grading(), 'stats'] as const,

  // ============================================================================
  // CONTENT SEARCH
  // ============================================================================
  
  content: () => [...classroomKeys.all, 'content'] as const,
  contentSearch: (params: ContentSearchParams) => 
    [...classroomKeys.content(), 'search', params] as const,
};
