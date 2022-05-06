import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletModalButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { FC } from "react";
import { WalletButton } from "./WalletButton";

type HeaderProps = {};

const Header: FC<HeaderProps> = () => {
    const wallet = useWallet();
    const {visible, setVisible} = useWalletModal();
    
    return (
        <div className="w-full px-6 py-4 flex items-center justify-between">
            <h1 className="font-bold text-2xl text-white">Serum Explorer</h1>
            <WalletButton />
        </div>
    )
}

export default Header;