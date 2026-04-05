export const itemStatusOptions = [
  {
    value: "owned",
    label: "Na colecao",
    shortLabel: "Colecao",
    description: "Item que ja faz parte da sua estante.",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "wishlist",
    label: "Wishlist",
    shortLabel: "Desejo",
    description: "Item que voce quer encontrar no futuro.",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "loaned",
    label: "Emprestado",
    shortLabel: "Emprestado",
    description: "Item fora de casa temporariamente.",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700",
  },
] as const;

export function getItemStatusMeta(status: string | null | undefined) {
  return (
    itemStatusOptions.find((option) => option.value === status) ?? itemStatusOptions[0]
  );
}
