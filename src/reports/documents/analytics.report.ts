import { TDocumentDefinitions } from 'pdfmake/interfaces';

// Define el tipo de datos para la entrada
interface ReportData {
  booksCount: number;
  booksValueByType: Record<string, number>;
  booksConditionAndTypeCount: Record<
    string,
    { book_condition: string; count: number }[]
  >;
  popularBooks: { book_title_original: string; book_loan: number }[];
  borrowedBooks: any[];
  borrowedBooksMonthy: any[];
}

// Asegúrate de que la función reciba un objeto `data` de tipo `ReportData`
export const ReportAnalytics = (data: ReportData): TDocumentDefinitions => {
  return {
    defaultStyle: { fontSize: 10 },
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: [
      {
        text: 'Reporte de Estadísticas - Biblioteca CPM',
        style: 'header',
      },
    ],
    content: [
      //fecha
      {
        text: `Fecha de generación: ${new Date().toLocaleDateString()}`,
        alignment: 'right',
        margin: [0, 0, 0, 20],
      },
      // Total de Libros
      {
        text: 'Estadísticas Generales',
        style: 'subheader',
      },
      {
        table: {
          widths: ['*', '*'],
          body: [['Total de Contenido', data.booksCount.toString()]],
        },
        style: 'body',
      },

      // Detalle de Condiciones por Tipo de Libro
      {
        text: 'Cantidad de Libros por Condición y Tipo',
        style: 'subheader',
      },
      {
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            ['Condición', 'Cantidad', 'Tipo de Libro'],
            ...Object.entries(data.booksConditionAndTypeCount).flatMap(
              ([type, conditions]) =>
                conditions.map((condition) => [
                  condition.book_condition,
                  condition.count,
                  type,
                ]),
            ),
          ],
        },
        style: 'body',
      },

      // Libros más Populares
      {
        text: 'Libros más Populares',
        style: 'subheader',
      },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Título', 'Cantidad de Préstamos'],
            ...data.popularBooks.map((book) => [
              book.book_title_original,
              book.book_loan.toString(),
            ]),
          ],
        },
        style: 'body',
      },
      // Valor total por tipo de libro
      {
        text: 'Valor por tipo de libro',
        style: 'subheader',
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            ...Object.entries(data.booksValueByType).map(([key, value]) => [
              key,
              `Bs ${value.toFixed(2)}`,
            ]),
          ],
        },
        style: 'body',
      },
      // Libros prestamos al mes
      {
        text: 'Libros por mes',
        style: 'subheader',
        pageBreak: 'before',
      },
      {
        table: {
          widths: ['*', '*'],
          body: [
            ['Fecha', 'Cantidad de Préstamos'],
            ...data.borrowedBooksMonthy
              .sort(
                (a, b) =>
                  new Date(b.month).getTime() - new Date(a.month).getTime(),
              )
              .map((order) => [
                order.month
                  ? new Date(order.month).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                  })
                  : 'S/F',
                order.count || 'Sin datos',
              ]),
          ],
        },
        style: 'body',
      },
      // Libros Prestados
      {
        text: 'Libros Prestados',
        style: 'subheader',
      },
      {
        table: {
          widths: ['*', 'auto', 'auto', '*'],
          body: [
            ['Título', 'Estado', 'Fecha de Préstamo', 'Fecha de Regreso'],
            ...data.borrowedBooks.map((order) => [
              order.books[0].book_title_original,
              order.order_status,
              new Date(order.order_at).toLocaleDateString(),
              order.order_regresado_at
                ? new Date(order.order_regresado_at).toLocaleDateString()
                : 'Pendiente',
            ]),
          ],
        },
        style: 'body',
      },
    ],
    footer: (currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      style: 'footer',
    }),
    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: 'center',
        margin: [0, 20],
      },
      subheader: {
        fontSize: 12,
        bold: true,
        margin: [0, 10],
      },
      body: {
        fontSize: 10,
        margin: [0, 5],
      },
      footer: {
        fontSize: 8,
        alignment: 'center',
        margin: [0, 10],
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        alignment: 'center',
        fillColor: '#f1f1f1',
      },
      tableCell: {
        fontSize: 9,
        alignment: 'center',
      },
      pageNumber: {
        fontSize: 8,
        alignment: 'center',
        margin: [0, 10],
      },
    },
  };
};
