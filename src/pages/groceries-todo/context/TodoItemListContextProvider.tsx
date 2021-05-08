import { useContext, useEffect, useState } from "react";
import ProductPriceApi from "../../../api/ProductPriceApi";
import TodoProductItemsApi from "../../../api/TodoProductItemsApi";
import { GroceriesTodoStoreContext } from "../../../components/todo-item-list/components/groceries-todo-store-context";
import TodoItem from "../../../components/todo-item-list/types";
import TodoItemListContext from "./TodoItemListContext";

interface TodoItemListContextProviderProps {

}

const TodoItemListContextProvider = (
    props: React.PropsWithChildren<TodoItemListContextProviderProps>,
) => {
    const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
    const { selectedStore } = useContext(GroceriesTodoStoreContext);

    useEffect(() => {
        TodoProductItemsApi.fetchTodoProductItems(selectedStore?.name)
            .then((fetchedTodoItems) => {
                setTodoItems(fetchedTodoItems);
            });
    }, []);

    const updateItemQuantity = (item: TodoItem, quantity: number) => {
        // eslint-disable-next-line no-param-reassign
        item.quantity = quantity;
        TodoProductItemsApi.update(item);
        setTodoItems([...todoItems]);
    };

    const addItem = async (item: TodoItem) => {
        const existingTodoItem = todoItems.find((addedTodoItem) => {
            const { targetProduct } = item;
            return addedTodoItem.generalName === item.generalName
                && addedTodoItem.targetProduct?.productBarcode === targetProduct?.productBarcode;
        });

        if (existingTodoItem) {
            updateItemQuantity(existingTodoItem, existingTodoItem.quantity + item.quantity);
            return;
        }

        await TodoProductItemsApi.add(item);

        const { targetProduct } = item;
        if (!targetProduct || !selectedStore) {
            setTodoItems(todoItems.concat(item));
            return;
        }

        const priceEntry = await ProductPriceApi.fetchLatestPrice(
            targetProduct, selectedStore.name
        );

        if (priceEntry) {
            const createdItem = item.setProductPrice(priceEntry.price);
            setTodoItems(todoItems.concat(createdItem));
        } else {
            setTodoItems(todoItems.concat(item));
        }
    };

    const removeItem = (removeTodoItem: TodoItem) => {
        TodoProductItemsApi.remove(removeTodoItem).then(() => {
            setTodoItems(todoItems.filter((item) => item.id !== removeTodoItem.id));
        });
    };

    const updateItem = (updatedTodoItem: TodoItem) => {
        const replacedTodoItems = todoItems.map((existingTodoItem) => (
            existingTodoItem.id === updatedTodoItem.id ? updatedTodoItem : existingTodoItem
        ));

        TodoProductItemsApi.update(updatedTodoItem);

        setTodoItems(replacedTodoItems);
    };

    const toggleItemPurchased = (item: TodoItem, toggle: boolean) => {
        // eslint-disable-next-line no-param-reassign
        item.isBought = toggle;
        updateItem(item);
    };

    const clearItems = () => {
        setTodoItems([]);
        TodoProductItemsApi.clear();
    };

    return (
        <TodoItemListContext.Provider value={{
            todoItems,
            addItem,
            removeItem,
            updateItem,
            toggleItemPurchased,
            updateItemQuantity,
            clearItems,
        }}>
            {props.children}
        </TodoItemListContext.Provider>
    );
};

export default TodoItemListContextProvider;
