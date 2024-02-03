import Image from "next/image";

// https://logoipsum.com/

export const Logo = () => {
	return <Image height={130} width={130} alt="logo" src="/logo.svg" />;
};
