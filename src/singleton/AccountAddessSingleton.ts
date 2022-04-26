export class AccountAddressSingleton {
    static instance: AccountAddressSingleton;
    data: Map<any, any>;

    public static getInstance(): AccountAddressSingleton {
        if (!AccountAddressSingleton.instance) {
            AccountAddressSingleton.instance = new AccountAddressSingleton();
        }
        return AccountAddressSingleton.instance;
    }

    private constructor() {
        this.data = new Map();
    }

    setData(key: any, value: any) {
        this.data = this.data.set(key, value);
    }

    getData(key: any) {
        return this.data.get(key);
    }
}
