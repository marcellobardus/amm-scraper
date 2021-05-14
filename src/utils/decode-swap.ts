import { AbiCoder, hexDataSlice } from "ethers/lib/utils";
import { DecodedSwap } from "../types";

export function decodeSwap(txData: string): DecodedSwap {
  const decoded = new AbiCoder().decode(
    ["uint", "uint", "address[]", "address", "uint"],
    hexDataSlice(txData, 4)
  );

  return {
    amountIn: decoded[0],
    amountOutMin: decoded[1],
    path: decoded[2],
    to: decoded[3],
    deadline: decoded[4],
  };
}
