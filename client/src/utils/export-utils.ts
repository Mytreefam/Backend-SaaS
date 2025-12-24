/**
 * Utilidades para exportar datos de tablas a diferentes formatos
 */

/**
 * Exporta datos a CSV
 */
export function exportToCSV(data: any[], filename: string, columns?: string[]) {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Determinar columnas
  const headers = columns || Object.keys(data[0]);
  
  // Crear CSV
  const csvContent = [
    // Headers
    headers.join(','),
    // Rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar valores que contengan comas o comillas
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Descargar archivo
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta datos a Excel (simulado como CSV con extensión .xlsx)
 * En producción real, usar librería como 'xlsx' o 'exceljs'
 */
export function exportToExcel(data: any[], filename: string, columns?: string[]) {
  // Por ahora, exportamos como CSV pero con extensión .xlsx
  // En producción, usar una librería real de Excel
  exportToCSV(data, filename, columns);
}

/**
 * Exporta datos a PDF (simulado)
 * En producción real, usar librería como 'jspdf' o 'pdfmake'
 */
export function exportToPDF(data: any[], filename: string, columns?: string[], title?: string) {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Simulación: crear un HTML formateado y abrirlo en nueva ventana
  const headers = columns || Object.keys(data[0]);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title || filename}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          color: #0d9488;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #0d9488;
          color: white;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title || filename}</h1>
      <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(h => `<td>${row[h] !== null && row[h] !== undefined ? row[h] : ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total de registros: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  // Abrir en nueva ventana para imprimir/guardar
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

/**
 * Función auxiliar para descargar archivos
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formatea datos para exportación
 */
export function formatDataForExport<T extends Record<string, any>>(
  data: T[],
  columnMapping: Record<keyof T, string>
): Record<string, any>[] {
  return data.map(row => {
    const formattedRow: Record<string, any> = {};
    Object.entries(columnMapping).forEach(([key, label]) => {
      formattedRow[label] = row[key];
    });
    return formattedRow;
  });
}
