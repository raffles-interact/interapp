import xlsx from 'node-xlsx';

export class BaseExportsModel {
  protected static getSheetOptions = <T extends unknown[]>(ret: T) => ({
    '!cols': [{ wch: 24 }, ...Array(ret.length).fill({ wch: 16 })],
  });
  protected static constructXLSX = (...data: Parameters<typeof xlsx.build>[0]) => xlsx.build(data);
}