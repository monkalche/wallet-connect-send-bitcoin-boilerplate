export const writeHistory = async (paymentAddress: string, amountToTransfer: number, txId: string, walletType: string) => {
    console.log("fetching faffles");
    const response = await fetch(`/api/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            paymentAddress,
            amountToTransfer,
            txId,
            walletType
        }),
    });
    console.log(response);
    if (response.status == 200) {
        const data = await response.json();
        return data;
    } else {
        return undefined;
    }
};

export const walletConnect = async (
    paymentAddress: string,
    paymentPublicKey: string,
    ordinalAddress: string,
    ordinalPublicKey: string, 
    walletType: string,
    hash: string
    ) => {
    
    const response = await fetch(`/api/walletConnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            paymentAddress,
            paymentPublicKey,
            ordinalAddress,
            ordinalPublicKey,
            walletType,
            hash
        }),
    });
    console.log(response);
    if (response.status == 200) {
        const data = await response.json();
        return data;
    } else {
        return undefined;
    }
};