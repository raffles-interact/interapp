import {
  AttendanceExportsResult,
  AttendanceExportsXLSX,
  AttendanceQueryExportsConditions,
  ExportsModelImpl,
  staticImplements,
} from './types';
import { BaseExportsModel } from './exports_base';
import { ServiceSession, type AttendanceStatus } from '@db/entities';
import { HTTPErrors } from '@utils/errors';
import { WorkSheet } from 'node-xlsx';
import appDataSource from '@utils/init_datasource';

// @staticImplements<ExportsModelImpl>()
export class ServiceHoursExportsModel extends BaseExportsModel {
}
