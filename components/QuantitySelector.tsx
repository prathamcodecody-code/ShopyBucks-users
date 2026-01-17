interface QuantityProps {
  qty: number;
  setQty: (value: number) => void;
}

export default function QuantitySelector({ qty, setQty }: QuantityProps) {
  return (
    <div className="flex gap-3 items-center mt-4">
      <button
        onClick={() => qty > 1 && setQty(qty - 1)}
        className="px-3 py-1 border rounded"
      >
        -
      </button>

      <span>{qty}</span>

      <button
        onClick={() => setQty(qty + 1)}
        className="px-3 py-1 border rounded"
      >
        +
      </button>
    </div>
  );
}
