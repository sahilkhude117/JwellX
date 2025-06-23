'use client';
import { useState, useCallback } from "react";
import { AttributeItem } from "@/lib/types/categories";

export const useAttributes = (initalData: AttributeItem[]) => {
    const [data, setData] = useState<AttributeItem[]>(initalData);
    const [isLoading, setIsLoading] = useState(false);

    const addItem = useCallback(async (name: string) => {
        setIsLoading(true);

        try {
            const newItem: AttributeItem = {
                id: `item_${Date.now()}`,
                name: name.trim(),
                productCount: 0,
            };
            setData(prev => [ ...prev, newItem]);
            console.log('Adding Item:', name);
        } catch (error) {
            console.error('Error adding item:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const editItem = useCallback(async (id: string, newName: string) => {
        setIsLoading(true);
        try{
            setData(prev => 
                prev.map(item =>
                    item.id === id ? { ...item, name: newName.trim() } : item
                )
            );
            console.log('Editing Item:', id, newName);
        } catch (error) {
            console.log("Error editing item:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteItem = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            setData(prev => prev.filter(item => item.id !== id));
            console.log('Deleting item:', id);
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);


    return {
        data,
        isLoading,
        addItem,
        editItem,
        deleteItem,
    };
};