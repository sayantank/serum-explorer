import { useEffect } from "react";
import { useMarket } from "../../../context/market";

export const TokenDisplay = () => {
  const { serumMarket, baseMetadata, quoteMetadata } = useMarket();

  useEffect(() => {
    console.log(serumMarket);
  }, [serumMarket]);

  if (!baseMetadata || !quoteMetadata) {
    return null;
  }

  return (
    <div>
      <h3 className="text-sm font-light text-cyan-500">Tokens</h3>
      <div className="text-2xl font-bold">
        <p>
          {baseMetadata.data.data.symbol} / {quoteMetadata.data.data.symbol}
        </p>
      </div>
    </div>
  );
};
