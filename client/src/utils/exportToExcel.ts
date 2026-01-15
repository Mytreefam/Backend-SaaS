// Utilidad para exportar datos a Excel usando SheetJS
import * as XLSX from 'xlsx';

export function exportToExcel({ data, fileName = 'datos.xlsx', sheetName = 'Datos' }) {
  // Convierte los datos a una hoja de SheetJS
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Genera el archivo y lo descarga
  XLSX.writeFile(workbook, fileName);
}
