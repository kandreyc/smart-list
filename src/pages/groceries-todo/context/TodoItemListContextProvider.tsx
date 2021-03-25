import { useEffect, useState } from "react";
import COUNTERPARTY_LIST from "../../../api/Constants";
import ProductPriceApi from "../../../api/ProductPriceApi";
import TodoProductItemsApi from "../../../api/TodoProductItemsApi";
import TodoItem from "../components/TodoItem";
import TodoItemListContext from "./TodoItemListContext";

interface TodoItemListContextProviderProps {
    onItemPurchaseToggle(item: TodoItem, isChecked: boolean): void;
}

export const TodoItemListContextProvider = (props: React.PropsWithChildren<TodoItemListContextProviderProps>) => {
    
    const [todoItems, setTodoItems] = useState<TodoItem[]>([]);

    useEffect(() => {
        TodoProductItemsApi.fetchTodoProductItems()
            .then(fetchedTodoItems => {
                const promiseList: Promise<any>[] = [];
                for (let todoItem of fetchedTodoItems) {
                    let enrichingPromise = enrichTodoItem(todoItem);
                    promiseList.push(enrichingPromise);
                }

                Promise.all(promiseList).then(_ => {
                    setTodoItems(fetchedTodoItems)
                });
            })
    }, []);

    const addItem = (item: TodoItem) => {
        TodoProductItemsApi.add(item).then(_ => {
            enrichTodoItem(item).then(_ => {
                setTodoItems(todoItems.concat(item));
            });
        })
    }

    const removeItem = (removeItem: TodoItem) => {
        TodoProductItemsApi.remove(removeItem).then(_ => {
            setTodoItems(todoItems.filter(item => item.id !== removeItem.id));
        });
    }

    const toggleItemPurchased = (item: TodoItem, toggle: boolean) => {
        item.isBought = toggle;
        props.onItemPurchaseToggle(item, toggle);
    }

    const updateItemQuantity = (item: TodoItem, quantity: number) => {
        item.quantity = quantity;
        TodoProductItemsApi.update(item);
    }

    const clearItems = () => {
        setTodoItems([]);
    }

    const enrichTodoItem = async (item: TodoItem): Promise<void> => {
        if (item.targetProduct) {
            let latestPricePromise = ProductPriceApi.fetchLatestPrice(item.targetProduct).then((entry) => {
                if (entry) {
                    item.priceData.latestPrice = entry.price;
                }
            });

            const priceFetchingPromiseList = [latestPricePromise];

            COUNTERPARTY_LIST.forEach(counterparty => {
                if (item.targetProduct) {
                    let fetchPromise = ProductPriceApi.fetchLatestPrice(item.targetProduct, counterparty)
                        .then(priceEntry => {
                            if (priceEntry) {
                                item.priceData.setCounterpartyPrice(counterparty, {price: priceEntry.price});
                            }
                        })
                    priceFetchingPromiseList.push(fetchPromise);
                }
            });

            return Promise.all(priceFetchingPromiseList)
                .then(_ => Promise.resolve());
        } else {
            return Promise.resolve();
        }
    }

    return (
        <TodoItemListContext.Provider value={{todoItems, addItem, removeItem, toggleItemPurchased, updateItemQuantity, clearItems}}>
            {props.children}
        </TodoItemListContext.Provider>
    )
}