import { BookEntity } from "src/books/entities/book.entity";

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLen = a.length;
  const bLen = b.length;

  for (let i = 0; i <= bLen; i++) matrix[i] = [i];
  for (let j = 0; j <= aLen; j++) matrix[0][j] = j;

  for (let i = 1; i <= bLen; i++) {
    for (let j = 1; j <= aLen; j++) {
      matrix[i][j] =
        b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
    }
  }
  return matrix[bLen][aLen];
}

export async function prioritizeBooksACO(
  searchTerm: string,
  books: BookEntity[],
  options = {
    preferredLanguage: 'es',
    alpha: 1,
    beta: 2,
    iterations: 20,
    ants: 10,
  }
): Promise<BookEntity[]> {
  const conditionWeights = {
    BUENO: 3,
    REGULAR: 2,
    MALO: 1,
  };

  const maxLevenshtein = Math.max(
    ...books.map(book =>
      Math.min(
        levenshtein(searchTerm, book.book_title_original || ''),
        levenshtein(searchTerm, book.book_title_parallel || '')
      )
    )
  );

  function calculateHeuristic(book: BookEntity): number {
    const levDist = Math.min(
      levenshtein(searchTerm, book.book_title_original || ''),
      levenshtein(searchTerm, book.book_title_parallel || '')
    );

    const simScore = 1 - levDist / (maxLevenshtein || 1);
    const conditionScore = (conditionWeights[book.book_condition] || 1) / 3;
    const languageScore = book.book_language === options.preferredLanguage ? 1 : 0;
    const quantityScore = Math.min(book.book_quantity / 10, 1);

    return (
      0.4 * simScore +
      0.2 * conditionScore +
      0.2 * languageScore +
      0.2 * quantityScore
    );
  }

  const pheromone: number[] = new Array(books.length).fill(1);
  const bookIndices = books.map((_, i) => i);

  let bestPath: number[] = [];
  let bestScore = -Infinity;

  for (let iter = 0; iter < options.iterations; iter++) {
    for (let ant = 0; ant < options.ants; ant++) {
      const path: number[] = [];
      const visited = new Set<number>();

      while (path.length < books.length) {
        const candidates = bookIndices.filter(i => !visited.has(i));

        const probabilities = candidates.map(i => {
          const heuristic = calculateHeuristic(books[i]);
          return Math.pow(pheromone[i], options.alpha) *
            Math.pow(heuristic, options.beta);
        });

        const totalProb = probabilities.reduce((sum, val) => sum + val, 0);
        const rand = Math.random() * totalProb;
        let cumulative = 0;
        let selected = candidates[0];

        for (let i = 0; i < candidates.length; i++) {
          cumulative += probabilities[i];
          if (rand <= cumulative) {
            selected = candidates[i];
            break;
          }
        }

        path.push(selected);
        visited.add(selected);
      }

      const score = path.reduce(
        (sum, idx, i) =>
          sum + calculateHeuristic(books[idx]) * (books.length - i),
        0
      );

      if (score > bestScore) {
        bestScore = score;
        bestPath = path;
      }
    }

  
    pheromone.forEach((_, i) => (pheromone[i] *= 0.9));
    bestPath.forEach(i => {
      pheromone[i] += bestScore / 100;
    });
  }

  const result = bestPath.map(i => books[i]);
  return result;
}
