export const getMinAvailableConditionPrice = (product: any): number | null => {
  if (!product.colors || product.colors.length === 0) return null;
  try {
    const parsed = product.colors.map((c: any) => JSON.parse(c));
    let minPrice: number | null = null;
    parsed.forEach((col: any) => {
      col.storages?.forEach((st: any) => {
        if (st.connectivities && st.connectivities.length > 0) {
          st.connectivities.forEach((conn: any) => {
            conn.conditions?.forEach((cond: any) => {
              if (cond.available !== false && cond.price != null && (minPrice === null || cond.price < minPrice)) {
                minPrice = cond.price;
              }
            });
          });
        } else if (st.conditions) {
          st.conditions.forEach((cond: any) => {
            if (cond.available !== false && cond.price != null && (minPrice === null || cond.price < minPrice)) {
              minPrice = cond.price;
            }
          });
        }
      });
    });
    return minPrice;
  } catch (e) {
    return null;
  }
};
