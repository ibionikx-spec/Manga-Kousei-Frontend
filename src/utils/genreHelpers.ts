export const getGenreIds = (
  genreNames: string[],
  genresList: { id: number; name: string }[],
): number[] => {
  return genreNames
    .map((name) => genresList.find((g) => g.name === name)?.id)
    .filter((id): id is number => id !== undefined);
};
