import { InlineMath, BlockMath } from "react-katex";

export const Math = ({ children, block = false }) => {
  if (block) return <BlockMath math={children} />;
  return <InlineMath math={children} />;
};

export const Eq = ({ children }) => (
  <div className="my-3 overflow-x-auto py-1 text-slate-800">
    <BlockMath math={children} />
  </div>
);
