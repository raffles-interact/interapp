import {
  AttendanceExportsResult,
  AttendanceExportsXLSX,
  AttendanceQueryExportsConditions,
} from './types';
import { BaseExportsModel } from './exports_base';
import { ServiceSession, type AttendanceStatus } from '@db/entities';
import { HTTPErrors } from '@utils/errors';
import { WorkSheet } from 'node-xlsx';
import appDataSource from '@utils/init_datasource';

export class ServiceHoursExportsModel extends BaseExportsModel {}
