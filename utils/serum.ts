import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export async function getVaultOwnerAndNonce(
  marketAddress: PublicKey,
  dexAddress: PublicKey
): Promise<[vaultOwner: PublicKey, nonce: BN]> {
  const nonce = new BN(0);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const vaultOwner = await PublicKey.createProgramAddress(
        [marketAddress.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
        dexAddress
      );
      return [vaultOwner, nonce];
    } catch (e) {
      nonce.iaddn(1);
    }
  }
}
