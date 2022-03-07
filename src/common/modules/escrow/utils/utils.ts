export class Utils {
  GetDetailPrice(req) {
    let totalPrice = 0;
    let totalAddtional = 0;

    req.prices.forEach((element) => {
      console.log('[GetDetailPrice] PriceList.', element);
      totalPrice += element.value;
    });

    req.additionalPrices.forEach((element) => {
      console.log('[GetDetailPrice] additional_prices.', element);
      totalAddtional += element.value;
    });

    return [totalPrice, totalAddtional];
  }
}
