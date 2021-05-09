/* eslint-disable max-classes-per-file */
import PriceData from "../../entity/PriceData";
import Product from "../../entity/Product";

export class ProductPriceData {
    latestPrice: number;

    private perCounterpartyPrice: Map<string, PriceData>;

    constructor() {
        this.latestPrice = 0;
        this.perCounterpartyPrice = new Map();
    }

    getCounterpartyPrice(counterparty: string): PriceData | undefined {
        return this.perCounterpartyPrice.get(counterparty);
    }

    setCounterpartyPrice(counterparty: string, priceData: PriceData) {
        this.perCounterpartyPrice.set(counterparty, priceData);
    }
}

export class Store {
    readonly id: number;

    readonly name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

class TodoItem {
    id: number;

    generalName: string;

    quantity: number;

    targetProduct: Product | null;

    isBought: boolean;

    readonly productPrice: number | null;

    readonly purchasedPrice: number | null;

    constructor(
        id: number,
        generalName: string,
        quantity: number,
        targetProduct: Product | null,
        isBought: boolean,
        productPrice: number | null,
        purchasedPrice: number | null
    ) {
        this.id = id;
        this.generalName = generalName;
        this.quantity = quantity;
        this.targetProduct = targetProduct;
        this.isBought = isBought;
        this.productPrice = productPrice;
        this.purchasedPrice = purchasedPrice;
    }

    static createTodoItem(
        id: number,
        generalName: string,
        productPrice: number | null = null
    ) {
        return new TodoItem(
            id,
            generalName,
            1,
            null,
            false,
            productPrice,
            null
        );
    }

    static fromProduct(product: Product, quantity?: number): TodoItem {
        const todoItem = this.createTodoItem(
            Date.now(),
            product.productGeneralName
        );

        todoItem.quantity = quantity || 1;
        todoItem.targetProduct = product;
        todoItem.isBought = false;
        return todoItem;
    }

    static fromName(name: string, quantity: number): TodoItem {
        const todoItem = this.createTodoItem(Date.now(), name);
        todoItem.quantity = quantity;
        todoItem.isBought = false;
        return todoItem;
    }

    static from(json: any): TodoItem {
        const {
            id,
            generalName,
            quantity,
            targetProduct,
            isBought,
            purchasedPrice,
        } = json;

        let product = null;
        if (targetProduct) {
            product = Product.from(json.targetProduct);
        }

        return new TodoItem(
            id,
            generalName,
            quantity,
            product,
            isBought,
            null,
            purchasedPrice
        );
    }

    setProductPrice(newPrice: number | null): TodoItem {
        const todoItem = new TodoItem(
            this.id,
            this.generalName,
            this.quantity,
            this.targetProduct,
            this.isBought,
            newPrice,
            this.purchasedPrice
        );
        return todoItem;
    }

    setTargetProduct(product: Product | null): TodoItem {
        const todoItem = new TodoItem(
            this.id,
            this.generalName,
            this.quantity,
            product,
            this.isBought,
            this.productPrice,
            this.purchasedPrice
        );
        return todoItem;
    }

    setPurchasedPrice(newPrice: number | null): TodoItem {
        const todoItem = new TodoItem(
            this.id,
            this.generalName,
            this.quantity,
            this.targetProduct,
            this.isBought,
            this.productPrice,
            newPrice
        );
        todoItem.targetProduct = this.targetProduct;
        return todoItem;
    }
}

export default TodoItem;
