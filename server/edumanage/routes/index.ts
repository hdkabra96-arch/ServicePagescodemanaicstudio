import express from 'express';
import { createEduManageAuthRouter } from './authRoutes.ts';
import { createEduManageDashboardSettingsRouter } from './dashboardSettingsRoutes.ts';
import { createEduManageStudentRouter } from './studentRoutes.ts';
import { createEduManageTeacherRouter } from './teacherRoutes.ts';
import { createEduManageAttendanceRouter } from './attendanceRoutes.ts';
import { createEduManageTimetableRouter } from './timetableRoutes.ts';
import { createEduManageHomeworkRouter } from './homeworkRoutes.ts';

export function createEduManageRouter(): express.Router {
  const router = express.Router();

  router.use(createEduManageAuthRouter());
  router.use(createEduManageDashboardSettingsRouter());
  router.use(createEduManageStudentRouter());
  router.use(createEduManageTeacherRouter());
  router.use(createEduManageAttendanceRouter());
  router.use(createEduManageTimetableRouter());
  router.use(createEduManageHomeworkRouter());

  return router;
}
