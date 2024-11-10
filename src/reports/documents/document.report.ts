import { StyleDictionary, TDocumentDefinitions } from 'pdfmake/interfaces';
const styles: StyleDictionary = {
  header: {
    fontSize: 10,
    alignment: 'right',
    margin: [10, 10],
  },
  subheader: {
    fontSize: 18,
    bold: true,
  },
  quote: {
    italics: true,
  },
  small: {
    fontSize: 8,
  },
};
export const Reports = (
  title?: string,
  data?: any[],
  columns?: any[],
  widths?: any[],
  mapFn?: (book: any, index: number) => any[],
): TDocumentDefinitions => {
  return {
    defaultStyle: { fontSize: 10 },
    pageSize: 'A4',
    header: { text: `${title} - CPM` || 'Reporte - CPM', style: 'header' },
    content: [
      {
        text: title,
        style: 'subheader',
      },
      {
        layout: 'lightHorizontalLines',
        margin: [0, 15],
        table: {
          heights: [15, 15],
          widths,
          headerRows: 1,
          body: [columns, ...data.map((book, index) => mapFn(book, index))],
        },
      },
    ],
    footer: (currentPage: number, pageCount: number) => {
      return {
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        margin: [0, 10],
        style: 'small',
      };
    },
    styles,
  };
};
